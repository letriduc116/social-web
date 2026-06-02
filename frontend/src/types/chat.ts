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

export type ChatCallSignalType =
  | 'CALL_OFFER'
  | 'CALL_ANSWER'
  | 'ICE_CANDIDATE'
  | 'CALL_END'
  | 'CALL_REJECT'
  | 'CALL_CANCEL';

export type ChatCallSignal = {
  conversationId: string;
  signalType: ChatCallSignalType;
  video: boolean;
  callerId?: string;
  callerName?: string;
  callerAvatar?: string | null;
  sdp?: RTCSessionDescriptionInit | Record<string, unknown> | null;
  candidate?: RTCIceCandidateInit | Record<string, unknown> | null;
};
