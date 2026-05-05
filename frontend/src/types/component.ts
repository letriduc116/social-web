import type { MouseEvent } from 'react';
import type { CreatePostModalPayload, PostItem, SharePostModalPayload } from './post';
import type { ProfilePost } from './user';

export interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: CreatePostModalPayload) => Promise<void> | void;
  userName?: string;
  userAvatarText?: string;
}

export interface SharePostModalProps {
  open: boolean;
  onClose: () => void;
  post: PostItem | null;
  onSubmit?: (payload: SharePostModalPayload) => Promise<void> | void;
  userName?: string;
  userAvatarText?: string;
}

export interface FeedPostCardProps {
  post: PostItem;
  onOpenDetail: (post: PostItem) => void;
  onCommentClick: (event: MouseEvent, post: PostItem) => void;
  onToggleLike: (event: MouseEvent, post: PostItem) => void;
  onShareClick?: (event: MouseEvent, post: PostItem) => void;
  onPostUpdated?: (post: PostItem) => void;
  onPostDeleted?: (postId: string) => void;
}

export interface PostDetailModalProps {
  open: boolean;
  onClose: () => void;
  post: PostItem | null;
  currentUserName?: string;
  currentUserAvatarText?: string;
  onPostUpdated?: (post: PostItem) => void;
  onCommentAdded?: () => void;
  onShareClick?: (post: PostItem) => void;
  onPostDeleted?: (postId: string) => void;
}

export interface PostCardProps {
  post: ProfilePost;
}

export interface PostListProps {
  posts: ProfilePost[];
}
