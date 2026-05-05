export interface PostImage {
  id?: string;
  urlImage?: string;
}

export interface PostUser {
  id: string;
  userName?: string;
  fullName?: string;
  email?: string;
  profileImage?: string;
  bio?: string;
  isOnline?: boolean;
}

export type PostVisibility = 'EVERYONE' | 'FRIENDS' | 'ONLY_ME';
export type PostPrivacy = 'public' | 'friends' | 'only_me';

export interface PostItem {
  id: string;
  content: string;
  createAt?: string;
  images: PostImage[];
  comments: number;
  likes: number;
  liked: boolean;
  savedPost: boolean;
  user: PostUser;
  visibility?: PostVisibility;
  shared?: boolean;
  sharedPost?: PostItem | null;
}

export interface CreatePostPayload {
  content: string;
  postImages: string[];
  user_Id: string;
  visibility?: PostVisibility;
}

export interface CreatePostModalPayload {
  content: string;
  files: File[];
  privacy: PostPrivacy;
}

export interface SharePostPayload {
  userId: string;
  originalPostId: string;
  content?: string;
  visibility?: PostVisibility;
}

export interface SharePostModalPayload {
  content: string;
  privacy: PostPrivacy;
}

export interface LikePostPayload {
  post_Id: string;
  user_Id: string;
}

export interface SavedPostProfile {
  id: string;
  content: string;
  createAt?: string;
  images: PostImage[];
  comments: number;
  likes: number;
  liked: boolean;
  savedPost: boolean;
  user: PostUser;
  visibility?: PostVisibility;
  shared?: boolean;
  sharedPost?: PostItem | null;
}
