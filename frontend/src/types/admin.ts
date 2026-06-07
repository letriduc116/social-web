export type AdminSection = 'dashboard' | 'users' | 'posts' | 'comments' | 'reportedUsers' | 'reportedContent';

export type AdminRole = 'USER' | 'ADMIN';

export type AdminPostVisibility = 'ALL' | 'EVERYONE' | 'FRIENDS' | 'ONLY_ME';
export type AdminPostTypeFilter = 'ALL' | 'ORIGINAL' | 'SHARED';
export type AdminCommentTypeFilter = 'ALL' | 'PARENT' | 'REPLY';

export interface AdminUserResponse {
  id: string;
  email?: string;
  userName?: string;
  fullName?: string;
  role?: AdminRole | string;
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

export interface AdminTrendPoint {
  label: string;
  posts: number;
  comments: number;
}

export type AdminReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED';
export type AdminReportSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AdminReportItem {
  id: string;
  targetId: string;
  targetLabel: string;
  reporterLabel: string;
  reason: string;
  status: AdminReportStatus;
  severity: AdminReportSeverity;
  createdAt: string;
  note?: string;
}
