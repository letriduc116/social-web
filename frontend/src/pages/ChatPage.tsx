import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HomeHeader from '../components/header/HomeHeader';
import ChatDetailsPanel from '../components/chat/ChatDetailsPanel';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import { useChatCall } from '../hook/useChatCall';
import { buildChatPreview, chatService, resolveAttachmentType } from '../services/chatService';
import {
  isChatSocketConnected,
  sendChatMessageSocket,
  sendChatTypingSocket,
  subscribeChatSocket,
} from '../services/chatSocket';
import type { ChatAttachmentMessageType, ChatConversation, ChatMessage, SendMessagePayload } from '../types/chat';
import '../styles/chat.css';
import '../styles/chat-media.css';

function getConversationTime(conversation: ChatConversation) {
  return conversation.updatedAt ? new Date(conversation.updatedAt).getTime() : 0;
}

function sortConversations(conversations: ChatConversation[]) {
  return [...conversations].sort((a, b) => getConversationTime(b) - getConversationTime(a));
}

function upsertConversation(conversations: ChatConversation[], incoming: ChatConversation) {
  const current = conversations.find((conversation) => conversation.id === incoming.id);
  const merged: ChatConversation = {
    ...(current ?? incoming),
    ...incoming,
    messages: incoming.messages?.length > 0 ? incoming.messages : (current?.messages ?? []),
    typing: current?.typing ?? incoming.typing ?? false,
  };

  const next = current
    ? conversations.map((conversation) => (conversation.id === incoming.id ? merged : conversation))
    : [merged, ...conversations];

  return sortConversations(next);
}

function updateConversationWithMessage(conversations: ChatConversation[], message: ChatMessage) {
  let hasConversation = false;

  const next = conversations.map((conversation) => {
    if (conversation.id !== message.conversationId) return conversation;

    hasConversation = true;

    const normalizedMessage: ChatMessage = {
      ...message,
      sender: message.mine ? 'me' : 'them',
    };
    const exists = conversation.messages.some((item) => item.id === normalizedMessage.id);
    const messages = exists
      ? conversation.messages.map((item) => (item.id === normalizedMessage.id ? normalizedMessage : item))
      : [...conversation.messages, normalizedMessage];

    return {
      ...conversation,
      messages,
      typing: false,
      lastMessage: buildChatPreview(normalizedMessage),
      lastMessageAt: 'Vừa xong',
      unreadCount: normalizedMessage.mine ? 0 : conversation.unreadCount + 1,
      updatedAt: normalizedMessage.createdAt || conversation.updatedAt,
    };
  });

  return hasConversation ? sortConversations(next) : conversations;
}

function ChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { startCall } = useChatCall();
  const typingTimerRef = useRef<number | null>(null);
  const selectedConversationIdRef = useRef('');

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId],
  );

  const sendPayload = useCallback(async (payload: SendMessagePayload) => {
    const sentBySocket = isChatSocketConnected() && sendChatMessageSocket(payload);

    if (!sentBySocket) {
      const message = await chatService.sendMessage(payload);
      setConversations((prev) => updateConversationWithMessage(prev, message));
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const messages = await chatService.getMessages(conversationId, 0, 30);
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, messages, unreadCount: 0, typing: false }
            : conversation,
        ),
      );
      await chatService.markAsRead(conversationId);
    } catch (error) {
      console.error('Không tải được tin nhắn:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Không tải được tin nhắn');
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const data = sortConversations(await chatService.getConversations());
      setConversations(data);

      const firstConversationId = data[0]?.id || '';
      setSelectedConversationId((current) => current || firstConversationId);

      if (firstConversationId) {
        void loadMessages(firstConversationId);
      }
    } catch (error) {
      console.error('Không tải được danh sách đoạn chat:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Không tải được danh sách đoạn chat');
    } finally {
      setLoading(false);
    }
  }, [loadMessages]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const disconnect = subscribeChatSocket({
      onMessage: (message) => {
        const activeConversationId = selectedConversationIdRef.current;

        setConversations((prev) => {
          const updated = updateConversationWithMessage(prev, message);
          return message.conversationId === activeConversationId
            ? updated.map((conversation) =>
                conversation.id === message.conversationId ? { ...conversation, unreadCount: 0 } : conversation,
              )
            : updated;
        });

        if (message.conversationId === activeConversationId) {
          void chatService.markAsRead(message.conversationId).catch((error) => {
            console.error('Không đánh dấu đã đọc:', error);
          });
        }
      },
      onConversation: (conversation) => {
        setConversations((prev) => upsertConversation(prev, conversation));
        setSelectedConversationId((current) => current || conversation.id);
      },
      onTyping: (payload) => {
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === payload.conversationId ? { ...conversation, typing: payload.typing } : conversation,
          ),
        );

        if (payload.typing) {
          window.setTimeout(() => {
            setConversations((prev) =>
              prev.map((conversation) =>
                conversation.id === payload.conversationId ? { ...conversation, typing: false } : conversation,
              ),
            );
          }, 1800);
        }
      },
      onError: (error) => {
        console.error('Chat WebSocket error:', error);
      },
    });

    return disconnect;
  }, []);

  const filteredConversations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) return conversations;

    return conversations.filter((conversation) =>
      [conversation.name, conversation.lastMessage].some((value) => value.toLowerCase().includes(normalizedSearch)),
    );
  }, [conversations, searchTerm]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setDraftMessage('');
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unreadCount: 0, typing: false } : conversation,
      ),
    );
    void loadMessages(conversationId);
  };

  const handleDraftMessageChange = (value: string) => {
    setDraftMessage(value);

    if (!selectedConversationId) return;

    sendChatTypingSocket({ conversationId: selectedConversationId, typing: Boolean(value.trim()) });

    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = window.setTimeout(() => {
      sendChatTypingSocket({ conversationId: selectedConversationId, typing: false });
      typingTimerRef.current = null;
    }, 900);
  };

  const handleSendText = async (text: string) => {
    const trimmedMessage = text.trim();
    if (!trimmedMessage || !selectedConversationId) return;

    setSending(true);
    setErrorMessage('');
    sendChatTypingSocket({ conversationId: selectedConversationId, typing: false });

    try {
      await sendPayload({
        conversationId: selectedConversationId,
        content: trimmedMessage,
        type: 'TEXT',
      });
    } catch (error) {
      console.error('Không gửi được tin nhắn:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Không gửi được tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    const trimmedMessage = draftMessage.trim();
    if (!trimmedMessage) return;

    setDraftMessage('');
    await handleSendText(trimmedMessage);
  };

  const handleSendSticker = async (sticker: string, attachmentUrl?: string) => {
    if (!selectedConversationId) return;

    setSending(true);
    setErrorMessage('');

    try {
      await sendPayload({
        conversationId: selectedConversationId,
        content: sticker,
        type: 'STICKER',
        attachmentUrl,
      });
    } catch (error) {
      console.error('Không gửi được sticker:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Không gửi được sticker');
    } finally {
      setSending(false);
    }
  };

  const handleSendAttachment = async (file: File, preferredType?: ChatAttachmentMessageType) => {
    if (!selectedConversationId) return;

    setSending(true);
    setErrorMessage('');

    try {
      const fallbackType = preferredType || resolveAttachmentType(file);
      const attachment = await chatService.uploadAttachment(file, fallbackType);

      await sendPayload({
        conversationId: selectedConversationId,
        content: attachment.originalFileName || file.name || fallbackType,
        type: attachment.type || fallbackType,
        attachmentUrl: attachment.url,
      });
    } catch (error) {
      console.error('Không gửi được file:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Không gửi được file');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-page-shell">
      <HomeHeader />

      <main className="chat-page-layout">
        <ChatSidebar
          conversations={filteredConversations}
          selectedConversationId={selectedConversationId}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectConversation={handleSelectConversation}
        />

        {selectedConversation ? (
          <>
            <ChatWindow
              conversation={selectedConversation}
              draftMessage={draftMessage}
              sending={sending}
              onDraftMessageChange={handleDraftMessageChange}
              onSendMessage={handleSendMessage}
              onSendQuickText={handleSendText}
              onSendAttachment={handleSendAttachment}
              onSendSticker={handleSendSticker}
              onStartCall={(video) => void startCall(selectedConversation, video)}
            />

            <ChatDetailsPanel conversation={selectedConversation} />
          </>
        ) : (
          <section className="chat-window" aria-label="Đoạn chat">
            <div className="chat-message-area" style={{ alignItems: 'center', justifyContent: 'center' }}>
              <p className="chat-empty-text">
                {loading
                  ? 'Đang tải đoạn chat...'
                  : errorMessage ||
                    'Chưa có đoạn chat nào. Hãy bấm Nhắn tin ở trang cá nhân hoặc trang tìm kiếm để bắt đầu.'}
              </p>
            </div>
          </section>
        )}
      </main>

      {errorMessage && selectedConversation && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 24,
            transform: 'translateX(-50%)',
            background: '#222',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: 8,
            zIndex: 9999,
          }}
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export default ChatPage;
