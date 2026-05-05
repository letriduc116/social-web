export interface CommentUser {
  id: string;
  userName?: string;
  fullName?: string;
  profileImage?: string;
}

export interface CommentItem {
  id: string;
  content: string;
  sender: CommentUser;
  createdAt?: string;
  updatedAt?: string | null;
  likesCount: number;
  isLiked: boolean;
  replies: CommentItem[];
}

export interface CreateCommentPayload {
  content: string;
  postId: string;
  parentCommentId?: string | null;
}

export interface CommentRequestBody extends CreateCommentPayload {
  senderId: string;
}

export interface ModifyCommentPayload {
  commentId: string;
  content: string;
}
