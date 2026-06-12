export type FriendshipStatus = 'SELF' | 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'FRIEND';

export type FriendRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'UNFRIENDED';

export interface FriendRequestResponse {
  id: string;

  requesterId: string;
  requesterUserName?: string;
  requesterFullName?: string;
  requesterAvatar?: string;

  receiverId: string;
  receiverUserName?: string;
  receiverFullName?: string;
  receiverAvatar?: string;

  status: FriendRequestStatus;
  createdAt?: string;
}

export interface FriendshipStatusResponse {
  targetUserId: string;
  status: FriendshipStatus;
  requestId?: string;
  following: boolean;
}

export type FriendSummary = {
  id: string;
  userName?: string;
  fullName?: string;
  profileImage?: string;
  avatarUrl?: string;
  mutualFriendsCount?: number;
  following?: boolean;
};
