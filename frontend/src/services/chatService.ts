import api from './api';
import type {
  ChatAttachmentMessageType,
  ChatAttachmentResponse,
  ChatConversation,
  ChatMessage,
  SendMessagePayload,
} from '../types/chat';

type ApiEnvelope<T> = {
  status: number;
  message: string | null;
  data: T;
};

const normalizeMessage = (message: Partial<ChatMessage>): ChatMessage => {
  const mine = Boolean(message.mine);

  return {
    id: message.id || `${message.conversationId || 'message'}-${Date.now()}`,
    conversationId: message.conversationId || '',
    senderId: message.senderId || '',
    senderName: message.senderName || 'Người dùng',
    senderAvatar: message.senderAvatar ?? null,
    mine,
    sender: message.sender || (mine ? 'me' : 'them'),
    type: message.type || 'TEXT',
    text: message.text || '',
    attachmentUrl: message.attachmentUrl ?? null,
    time: message.time || '',
    status: message.status ?? null,
    createdAt: message.createdAt || new Date().toISOString(),
  };
};

const normalizeConversation = (conversation: Partial<ChatConversation>): ChatConversation => ({
  id: conversation.id || '',
  name: conversation.name || 'Người dùng',
  avatarColor: conversation.avatarColor || '#1976d2',
  avatarUrl: conversation.avatarUrl ?? null,
  status: conversation.status || 'offline',
  activeLabel: conversation.activeLabel || 'Hoạt động gần đây',
  lastMessage: conversation.lastMessage || 'Chưa có tin nhắn',
  lastMessageAt: conversation.lastMessageAt || '',
  unreadCount: conversation.unreadCount ?? 0,
  pinned: Boolean(conversation.pinned),
  typing: Boolean(conversation.typing),
  updatedAt: conversation.updatedAt || new Date().toISOString(),
  messages: (conversation.messages || []).map(normalizeMessage),
});

export const buildChatPreview = (message: ChatMessage): string => {
  const prefix = message.mine || message.sender === 'me' ? 'Bạn: ' : '';

  if (message.type === 'IMAGE') return `${prefix}Đã gửi một ảnh`;
  if (message.type === 'VIDEO') return `${prefix}Đã gửi một video`;
  if (message.type === 'AUDIO') return `${prefix}Đã gửi một ghi âm`;
  if (message.type === 'FILE') return `${prefix}Đã gửi một tệp`;
  if (message.type === 'STICKER') return `${prefix}Đã gửi một sticker`;

  return `${prefix}${message.text || ''}`;
};

export const resolveAttachmentType = (file: File | Blob, fallback: ChatAttachmentMessageType = 'FILE') => {
  const type = file.type || '';

  if (type.startsWith('image/')) return 'IMAGE' as const;
  if (type.startsWith('video/')) return 'VIDEO' as const;
  if (type.startsWith('audio/')) return 'AUDIO' as const;

  return fallback;
};

export const chatService = {
  async getConversations(): Promise<ChatConversation[]> {
    const response = await api.get<ApiEnvelope<ChatConversation[]>>('/v1/chats/conversations');
    return (response.data.data || []).map(normalizeConversation);
  },

  async openPrivateConversation(receiverId: string): Promise<ChatConversation> {
    const response = await api.post<ApiEnvelope<ChatConversation>>(`/v1/chats/conversations/private/${receiverId}`);
    return normalizeConversation(response.data.data);
  },

  async getMessages(conversationId: string, page = 0, size = 30): Promise<ChatMessage[]> {
    const response = await api.get<ApiEnvelope<ChatMessage[]>>(`/v1/chats/conversations/${conversationId}/messages`, {
      params: { page, size },
    });

    return (response.data.data || []).map(normalizeMessage);
  },

  async sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
    const response = await api.post<ApiEnvelope<ChatMessage>>('/v1/chats/messages', {
      ...payload,
      type: payload.type || 'TEXT',
    });

    return normalizeMessage(response.data.data);
  },

  async uploadAttachment(file: File | Blob, fallbackType: ChatAttachmentMessageType = 'FILE'): Promise<ChatAttachmentResponse> {
    const fileName = file instanceof File ? file.name : fallbackType === 'AUDIO' ? `voice-${Date.now()}.webm` : `file-${Date.now()}`;
    const formData = new FormData();
    formData.append('file', file, fileName);

    const response = await api.post<ApiEnvelope<ChatAttachmentResponse>>('/v1/chats/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data.data;
    return {
      ...data,
      type: data.type || resolveAttachmentType(file, fallbackType),
    };
  },

  async markAsRead(conversationId: string): Promise<void> {
    await api.patch(`/v1/chats/conversations/${conversationId}/read`);
  },
};
