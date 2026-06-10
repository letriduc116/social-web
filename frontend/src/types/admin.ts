export type AdminSection = 'dashboard' | 'users' | 'posts' | 'comments' | 'reportedUsers' | 'reportedContent';

export type AdminRole = 'USER' | 'MANAGER' | 'ADMIN';
export type AdminEditableRole = 'USER' | 'MANAGER';
export type AdminReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED';
export type AdminReportTargetType = 'USER' | 'POST' | 'COMMENT';
export type AdminPostVisibility = 'ALL' | 'EVERYONE' | 'FRIENDS' | 'ONLY_ME';
export type AdminPostTypeFilter = 'ALL' | 'ORIGINAL' | 'SHARED';
export type AdminCommentTypeFilter = 'ALL' | 'PARENT' | 'REPLY';

export interface AdminUserResponse {
  id: string;
  email?: string;
  userName?: string;
  fullName?: string;
  role?: AdminRole | string;
  locked?: boolean;
  profileImage?: string | null;
  coverImage?: string | null;
  createAt?: string;
  createdAt?: string;
}

export interface AdminPostResponse {
  id: string;
  content?: string;
  createAt?: string;
  authorId?: string;
  authorName?: string;
  authorEmail?: string;
  authorAvatar?: string;
  visibility?: string;
  shared: boolean;
  sharedPostId?: string | null;
  sharedPostContent?: string | null;
  likes: number;
  comments: number;
  imageUrls: string[];
  hidden?: boolean;
}

export interface AdminCommentResponse {
  id: string;
  content?: string;
  createAt?: string;
  senderId?: string;
  senderName?: string;
  senderEmail?: string;
  senderAvatar?: string;
  postId?: string;
  postContent?: string;
  parentCommentId?: string | null;
  parentCommentContent?: string | null;
  likesCount: number;
  repliesCount: number;
  hidden?: boolean;
}

export interface AdminPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface AdminListParams {
  keyword?: string;
  page?: number;
  size?: number;
}

export interface AdminCommentListParams extends AdminListParams {
  postId?: string;
}

export interface AdminReportListParams extends AdminListParams {
  status?: AdminReportStatus | 'ALL' | '';
}

export interface AdminReportStatsResponse {
  totalReports: number;
  pendingReports: number;
  reviewingReports: number;
  resolvedReports: number;
  rejectedReports: number;
  userReports: number;
  postReports: number;
  commentReports: number;
}

export interface AdminReportPostCommentResponse {
  id: string;
  content?: string;
  createAt?: string;
  senderId?: string;
  senderName?: string;
  senderEmail?: string;
  senderAvatar?: string;
  parentCommentId?: string | null;
  depth?: number;
  likesCount?: number;
  repliesCount?: number;
  hidden?: boolean;
}

export interface AdminReportResponse {
  id: string;
  targetType?: AdminReportTargetType | string;
  reason?: string;
  reasonCode?: string;
  reasonLabel?: string;
  description?: string;
  status?: AdminReportStatus | string;
  statusLabel?: string;
  adminNote?: string;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
  actionApplied?: boolean;
  actionAt?: string;

  reporterId?: string;
  reporterName?: string;
  reporterEmail?: string;
  reporterAvatar?: string;

  reportedUserId?: string;
  reportedUserName?: string;
  reportedUserFullName?: string;
  reportedUserEmail?: string;
  reportedUserAvatar?: string;
  reportedUserLocked?: boolean;

  postId?: string;
  postContent?: string;
  postCreatedAt?: string;
  postVisibility?: string;
  postShared?: boolean;
  postLikesCount?: number;
  postCommentsCount?: number;
  postImageUrls?: string[];
  postAuthorId?: string;
  postAuthorName?: string;
  postAuthorEmail?: string;
  postAuthorAvatar?: string;
  postHidden?: boolean;

  commentId?: string;
  commentContent?: string;
  commentCreatedAt?: string;
  commentSenderId?: string;
  commentSenderName?: string;
  commentSenderEmail?: string;
  parentCommentId?: string | null;
  commentHidden?: boolean;

  postComments?: AdminReportPostCommentResponse[];
}

export interface AdminTrendPoint {
  label: string;
  posts: number;
  comments: number;
}
