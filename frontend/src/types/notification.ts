export type NotificationType = 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED' | 'SYSTEM';

export interface NotificationResponse {
  id: string;
  receiverId: string;

  senderId?: string;
  senderUserName?: string;
  senderFullName?: string;
  senderAvatar?: string;

  type: NotificationType;
  title: string;
  message?: string;
  referenceId?: string;

  read: boolean;
  createdAt?: string;
}
