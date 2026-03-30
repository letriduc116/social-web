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
}

export interface SavedPostProfile {
  id: string;
  content: string;
  createdAt?: string;
  likeCount: number;
  commentCount: number;
  imageUrls: PostImage[];
  userId: string;
  userName: string;
  avatarUrl?: string;
}

export interface CreatePostPayload {
  content: string;
  postImages: string[];
  user_Id: string;
}

export interface SavedPostPayload {
  postId: string;
  userId: string;
}

export type PostFeedTab = 'all' | 'mine' | 'saved';

export interface PostCollections {
  all: PostItem[];
  mine: PostItem[];
  saved: PostItem[];
}

export interface PostComposerState {
  content: string;
  imageUrls: string[];
}
