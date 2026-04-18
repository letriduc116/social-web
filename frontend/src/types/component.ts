import type { MouseEvent } from 'react';
import type { CreatePostModalPayload, PostItem } from './post';
import type { ProfilePost } from './user';

export interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: CreatePostModalPayload) => Promise<void> | void;
  userName?: string;
  userAvatarText?: string;
}

export interface FeedPostCardProps {
  post: PostItem;
  onOpenDetail: (post: PostItem) => void;
  onCommentClick: (event: MouseEvent, post: PostItem) => void;
  onToggleLike: (event: MouseEvent, post: PostItem) => void;
}

export interface PostDetailModalProps {
  open: boolean;
  onClose: () => void;
  post: PostItem | null;
  currentUserName?: string;
  currentUserAvatarText?: string;
  onPostUpdated?: (post: PostItem) => void;
  onCommentAdded?: () => void;
}

export interface PostCardProps {
  post: ProfilePost;
}

export interface PostListProps {
  posts: ProfilePost[];
}
