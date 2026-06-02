import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import MiniChatWindow from '../components/chat/MiniChatWindow';
import ChatCallProvider from './ChatCallContext';
import { useChatCall } from '../hook/useChatCall';
import { MiniChatContext } from '../services/miniChatStore';
import { buildChatPreview, chatService, resolveAttachmentType } from '../services/chatService';
import {
  isChatSocketConnected,
  sendChatMessageSocket,
  sendChatTypingSocket,
  subscribeChatSocket,
} from '../services/chatSocket';
import type { ChatAttachmentMessageType, ChatConversation, ChatMessage, SendMessagePayload } from '../types/chat';
import '../styles/miniChat.css';
import '../styles/chat-media.css';

const MAX_VISIBLE_MINI_CHATS = 3;

type MiniChatProviderProps = {
  children: ReactNode;
};

type OpenMiniChat = {
  conversationId: string;
  draftMessage: string;
  isMinimized: boolean;
};

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

    const normalizedMessage = { ...message, sender: message.mine ? 'me' : 'them' } as ChatMessage;
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
      updatedAt: normalizedMessage.createdAt ?? conversation.updatedAt,
    };
  });

  return hasConversation ? sortConversations(next) : conversations;
}

function MiniChatProviderInner({ children }: MiniChatProviderProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [openChats, setOpenChats] = useState<OpenMiniChat[]>([]);
  const { startCall } = useChatCall();

  const conversationsRef = useRef<ChatConversation[]>([]);
  const openChatsRef = useRef<OpenMiniChat[]>([]);
  const typingTimerMapRef = useRef<Record<string, number>>({});

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    openChatsRef.current = openChats;
  }, [openChats]);

  const sendPayload = useCallback(async (payload: SendMessagePayload) => {
    const sentBySocket = isChatSocketConnected() && sendChatMessageSocket(payload);

    if (!sentBySocket) {
      const message = await chatService.sendMessage(payload);
      setConversations((prev) => updateConversationWithMessage(prev, message));
    }
  }, []);

  const refreshConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const data = await chatService.getConversations();
      setConversations(sortConversations(data));
    } catch (error) {
      console.error('Không tải được danh sách mini chat:', error);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const messages = await chatService.getMessages(conversationId, 0, 30);

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId ? { ...conversation, messages, unreadCount: 0 } : conversation,
        ),
      );

      await chatService.markAsRead(conversationId);
    } catch (error) {
      console.error('Không tải được tin nhắn mini chat:', error);
    }
  }, []);

  useEffect(() => {
    void refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    const disconnect = subscribeChatSocket({
      onMessage: (message) => {
        const isOpen = openChatsRef.current.some((chat) => chat.conversationId === message.conversationId);

        setConversations((prev) => {
          const updated = updateConversationWithMessage(prev, message);
          return isOpen
            ? updated.map((conversation) =>
                conversation.id === message.conversationId ? { ...conversation, unreadCount: 0 } : conversation,
              )
            : updated;
        });

        if (isOpen) {
          void chatService.markAsRead(message.conversationId).catch((error) => {
            console.error('Không đánh dấu đã đọc mini chat:', error);
          });
        }
      },
      onConversation: (conversation) => {
        setConversations((prev) => upsertConversation(prev, conversation));
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
        console.error('Mini chat WebSocket error:', error);
      },
    });

    return disconnect;
  }, []);

  const openMiniChat = useCallback(
    async (conversationIdOrReceiverId: string) => {
      if (!conversationIdOrReceiverId) return;

      let conversation = conversationsRef.current.find((item) => item.id === conversationIdOrReceiverId);

      if (!conversation) {
        try {
          conversation = await chatService.openPrivateConversation(conversationIdOrReceiverId);
          setConversations((prev) => upsertConversation(prev, conversation as ChatConversation));
        } catch (error) {
          console.error('Không mở được đoạn chat:', error);
          return;
        }
      }

      if (!conversation) return;

      const conversationId = conversation.id;

      setOpenChats((prev) => {
        const currentChat = prev.find((chat) => chat.conversationId === conversationId);
        const otherChats = prev.filter((chat) => chat.conversationId !== conversationId);

        return [
          ...otherChats,
          {
            conversationId,
            draftMessage: currentChat?.draftMessage || '',
            isMinimized: false,
          },
        ];
      });

      setConversations((prev) =>
        prev.map((item) => (item.id === conversationId ? { ...item, unreadCount: 0, typing: false } : item)),
      );

      void loadMessages(conversationId);
    },
    [loadMessages],
  );

  const closeMiniChat = useCallback((conversationId: string) => {
    setOpenChats((prev) => prev.filter((chat) => chat.conversationId !== conversationId));
  }, []);

  const minimizeMiniChat = useCallback((conversationId: string) => {
    setOpenChats((prev) =>
      prev.map((chat) => (chat.conversationId === conversationId ? { ...chat, isMinimized: true } : chat)),
    );
  }, []);

  const updateDraftMessage = (conversationId: string, draftMessage: string) => {
    setOpenChats((prev) =>
      prev.map((chat) => (chat.conversationId === conversationId ? { ...chat, draftMessage } : chat)),
    );

    sendChatTypingSocket({ conversationId, typing: Boolean(draftMessage.trim()) });

    const currentTimer = typingTimerMapRef.current[conversationId];
    if (currentTimer) {
      window.clearTimeout(currentTimer);
    }

    typingTimerMapRef.current[conversationId] = window.setTimeout(() => {
      sendChatTypingSocket({ conversationId, typing: false });
      delete typingTimerMapRef.current[conversationId];
    }, 900);
  };

  const sendMiniText = async (conversationId: string, text: string) => {
    const trimmedMessage = text.trim();
    if (!trimmedMessage) return;

    sendChatTypingSocket({ conversationId, typing: false });

    try {
      await sendPayload({
        conversationId,
        content: trimmedMessage,
        type: 'TEXT',
      });
    } catch (error) {
      console.error('Không gửi được tin nhắn mini chat:', error);
    }
  };

  const sendMiniMessage = async (conversationId: string) => {
    const currentChat = openChatsRef.current.find((chat) => chat.conversationId === conversationId);
    const trimmedMessage = currentChat?.draftMessage.trim() || '';

    if (!trimmedMessage) return;

    updateDraftMessage(conversationId, '');
    await sendMiniText(conversationId, trimmedMessage);
  };

  const sendMiniSticker = async (conversationId: string, sticker: string, attachmentUrl?: string) => {
    try {
      await sendPayload({
        conversationId,
        content: sticker,
        type: 'STICKER',
        attachmentUrl,
      });
    } catch (error) {
      console.error('Không gửi được sticker mini chat:', error);
    }
  };

  const sendMiniAttachment = async (conversationId: string, file: File, preferredType?: ChatAttachmentMessageType) => {
    try {
      const fallbackType = preferredType || resolveAttachmentType(file);
      const attachment = await chatService.uploadAttachment(file, fallbackType);

      await sendPayload({
        conversationId,
        content: attachment.originalFileName || file.name || fallbackType,
        type: attachment.type || fallbackType,
        attachmentUrl: attachment.url,
      });
    } catch (error) {
      console.error('Không gửi được file mini chat:', error);
    }
  };

  const visibleChatIds = useMemo(
    () =>
      openChats
        .filter((chat) => !chat.isMinimized)
        .slice(-MAX_VISIBLE_MINI_CHATS)
        .map((chat) => chat.conversationId),
    [openChats],
  );
  const visibleChatIdSet = useMemo(() => new Set(visibleChatIds), [visibleChatIds]);
  const arrangedChats = useMemo(
    () => [
      ...openChats.filter((chat) => visibleChatIdSet.has(chat.conversationId)),
      ...openChats.filter((chat) => !visibleChatIdSet.has(chat.conversationId)),
    ],
    [openChats, visibleChatIdSet],
  );
  const hasBubbleColumn = arrangedChats.length > visibleChatIds.length;

  const contextValue = useMemo(
    () => ({
      conversations,
      loadingConversations,
      openMiniChat,
      closeMiniChat,
      minimizeMiniChat,
      refreshConversations,
    }),
    [conversations, loadingConversations, openMiniChat, closeMiniChat, minimizeMiniChat, refreshConversations],
  );

  return (
    <MiniChatContext.Provider value={contextValue}>
      {children}
      {arrangedChats.map((chat, index) => {
        const conversation = conversations.find((item) => item.id === chat.conversationId);
        const isVisibleWindow = visibleChatIdSet.has(chat.conversationId);
        const positionIndex = isVisibleWindow
          ? visibleChatIds.indexOf(chat.conversationId)
          : index - visibleChatIds.length;

        if (!conversation) return null;

        return (
          <MiniChatWindow
            key={chat.conversationId}
            conversation={conversation}
            draftMessage={chat.draftMessage}
            isMinimized={!isVisibleWindow}
            positionIndex={positionIndex}
            reserveBubbleColumn={hasBubbleColumn}
            onDraftMessageChange={(value) => updateDraftMessage(chat.conversationId, value)}
            onSendMessage={() => void sendMiniMessage(chat.conversationId)}
            onSendQuickText={(text) => void sendMiniText(chat.conversationId, text)}
            onSendAttachment={(file, type) => void sendMiniAttachment(chat.conversationId, file, type)}
            onSendSticker={(sticker, attachmentUrl) =>
              void sendMiniSticker(chat.conversationId, sticker, attachmentUrl)
            }
            onRestore={() => void openMiniChat(chat.conversationId)}
            onMinimize={() => minimizeMiniChat(chat.conversationId)}
            onClose={() => closeMiniChat(chat.conversationId)}
            onStartCall={(video) => void startCall(conversation, video)}
          />
        );
      })}
    </MiniChatContext.Provider>
  );
}

function MiniChatProvider(props: MiniChatProviderProps) {
  return (
    <ChatCallProvider>
      <MiniChatProviderInner {...props} />
    </ChatCallProvider>
  );
}

export default MiniChatProvider;
