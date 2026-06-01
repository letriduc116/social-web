export type ChatUserStatus = 'online' | 'away' | 'offline' | string;
export type ChatMessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'STICKER';
export type ChatAttachmentMessageType = Extract<ChatMessageType, 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE'>;
export type ChatMessageStatus = 'sent' | 'seen' | string | null;

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  mine: boolean;
  sender: 'me' | 'them';
  type: ChatMessageType;
  text: string;
  attachmentUrl?: string | null;
  time: string;
  status?: ChatMessageStatus;
  createdAt: string;
};

export type ChatConversation = {
  id: string;
  name: string;
  avatarColor: string;
  avatarUrl?: string | null;
  status: ChatUserStatus;
  activeLabel: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  pinned: boolean;
  typing: boolean;
  updatedAt: string;
  messages: ChatMessage[];
};

export type SendMessagePayload = {
  conversationId?: string;
  receiverId?: string;
  content: string;
  type?: ChatMessageType;
  attachmentUrl?: string;
};

export type TypingPayload = {
  conversationId: string;
  typing: boolean;
};

export type ChatAttachmentResponse = {
  fileName: string;
  originalFileName: string;
  url: string;
  type: ChatAttachmentMessageType;
  contentType: string;
  size: number;
};
