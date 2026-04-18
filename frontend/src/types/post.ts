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

export interface CreatePostPayload {
  content: string;
  postImages: string[];
  user_Id: string;
}

export interface CreatePostModalPayload {
  content: string;
  files: File[];
  privacy: 'public' | 'friends' | 'only_me';
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
}
