export interface UserSummary {
  id: string;
  userName?: string;
  fullName?: string;
  email?: string;
  profileImage?: string;
  bio?: string;
}

export interface ProfilePostImage {
  id?: string;
  urlImage?: string;
}

export interface ProfilePost {
  id: string;
  content: string;
  createdAt?: string;
  likeCount: number;
  commentCount: number;
  userId: string;
  userName?: string;
  avatarUrl?: string;
  imageUrls: ProfilePostImage[];
}

export interface UserProfileResponse {
  userId: string;
  userName?: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  postCount?: number;
  followers?: UserSummary[];
  followings?: UserSummary[];
  posts: ProfilePost[];
}

export type ProfileTabKey = 'posts' | 'followers' | 'following';
