import { ApiService, type ApiResponse } from './api';
import { authStorage } from './authStorage';
import type {
  CreatePostModalPayload,
  CreatePostPayload,
  LikePostPayload,
  PostItem,
  PostPrivacy,
  PostVisibility,
  SavedPostProfile,
  SharePostModalPayload,
  SharePostPayload,
  UpdatePostPayload,
} from '../types/post';

const API_URL = '/v1/post';
const LIKE_API_URL = '/v1/like';
const SAVED_POST_API_URL = '/v1/saved-post';
const REPORT_API_URL = '/v1/reports';

const unwrap = <T>(response: ApiResponse<T> | T): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T;
  }
  return response as T;
};

const privacyToVisibility = (privacy?: PostPrivacy): PostVisibility => {
  switch (privacy) {
    case 'friends':
      return 'FRIENDS';
    case 'only_me':
      return 'ONLY_ME';
    case 'public':
    default:
      return 'EVERYONE';
  }
};

const uploadImages = async (files: File[]): Promise<string[]> => {
  if (!files.length) return [];

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  // BE upload ảnh đang dùng /file/upload, không nằm dưới /api.
  const response = await ApiService.upload<ApiResponse<string[]> | string[]>('/file/upload', formData, {
    baseURL: 'http://localhost:8080',
  });

  return unwrap(response) || [];
};

const createPost = async (payload: CreatePostModalPayload): Promise<string> => {
  const body: CreatePostPayload = {
    content: payload.content,
    postImages: await uploadImages(payload.files),
    user_Id: authStorage.getCurrentUserId(),
    visibility: privacyToVisibility(payload.privacy),
  };

  const response = await ApiService.post<ApiResponse<string> | string, CreatePostPayload>(API_URL, body);
  return unwrap(response);
};

const getAllPosts = async (): Promise<PostItem[]> => {
  const response = await ApiService.get<ApiResponse<PostItem[]> | PostItem[]>(API_URL, {
    id: authStorage.getCurrentUserId(),
  });

  return unwrap(response) || [];
};

const getMyPosts = async (): Promise<PostItem[]> => {
  const response = await ApiService.get<ApiResponse<PostItem[]> | PostItem[]>(`${API_URL}/minePost`, {
    id: authStorage.getCurrentUserId(),
  });

  return unwrap(response) || [];
};

const getPostsByUserId = async (userId: string): Promise<PostItem[]> => {
  const viewerId = authStorage.getCurrentUserId();

  try {
    const response = await ApiService.get<ApiResponse<PostItem[]> | PostItem[]>(`${API_URL}/user`, {
      userId,
      viewerId,
    });

    return unwrap(response) || [];
  } catch {
    if (userId === viewerId) return getMyPosts();
    const allPosts = await getAllPosts();
    return allPosts.filter((post) => post.user?.id === userId);
  }
};

const getSavedPosts = async (): Promise<SavedPostProfile[]> => {
  const response = await ApiService.get<ApiResponse<SavedPostProfile[]> | SavedPostProfile[]>(`${API_URL}/saved`, {
    userId: authStorage.getCurrentUserId(),
  });

  return unwrap(response) || [];
};

const likePost = async (postId: string): Promise<void> => {
  const body: LikePostPayload = {
    post_Id: postId,
    user_Id: authStorage.getCurrentUserId(),
  };

  await ApiService.post<ApiResponse<null>, LikePostPayload>(LIKE_API_URL, body);
};

const unlikePost = async (postId: string): Promise<void> => {
  const body: LikePostPayload = {
    post_Id: postId,
    user_Id: authStorage.getCurrentUserId(),
  };

  await ApiService.delete<ApiResponse<null>>(LIKE_API_URL, {
    data: body,
  });
};

const savePost = async (postId: string): Promise<void> => {
  await ApiService.post(`${SAVED_POST_API_URL}/save`, {
    postId,
    userId: authStorage.getCurrentUserId(),
  });
};

const unsavePost = async (postId: string): Promise<void> => {
  await ApiService.delete(`${SAVED_POST_API_URL}/delete`, {
    data: {
      postId,
      userId: authStorage.getCurrentUserId(),
    },
  });
};

const deletePost = async (postId: string): Promise<void> => {
  await ApiService.delete<ApiResponse<null>>(API_URL, {
    params: { postId },
  });
};

const updatePost = async (postId: string, payload: UpdatePostPayload): Promise<PostItem> => {
  const response = await ApiService.put<ApiResponse<PostItem> | PostItem, UpdatePostPayload>(
    `${API_URL}/update`,
    payload,
    {
      params: { postId },
    },
  );

  return unwrap(response);
};

const getOriginalPostIdForShare = (postOrId: PostItem | string): string => {
  if (typeof postOrId === 'string') {
    return postOrId;
  }

  return postOrId.sharedPost?.id || postOrId.id;
};

const sharePost = async (postOrId: PostItem | string, payload: SharePostModalPayload): Promise<PostItem> => {
  const originalPostId = getOriginalPostIdForShare(postOrId);

  if (!originalPostId) {
    throw new Error('Thiếu originalPostId bài viết gốc');
  }

  const body: SharePostPayload = {
    userId: authStorage.getCurrentUserId(),
    originalPostId,
    content: payload.content,
    visibility: privacyToVisibility(payload.privacy),
  };

  const response = await ApiService.post<ApiResponse<PostItem> | PostItem, SharePostPayload>(`${API_URL}/share`, body);

  return unwrap(response);
};

const normalizeReportReason = (reasonId: string): string => {
  switch (reasonId) {
    case 'spam_or_scam':
    case 'spam':
      return 'spam';
    case 'hate_or_harassment':
    case 'harassment':
      return 'harassment';
    case 'violence':
    case 'violence_or_inappropriate':
      return 'violence';
    case 'intellectual_property':
      return 'intellectual_property';
    default:
      return reasonId || 'other';
  }
};

const getReportDescription = (reasonId: string): string => {
  switch (normalizeReportReason(reasonId)) {
    case 'spam':
      return 'Người dùng báo cáo bài viết có dấu hiệu spam, lừa đảo hoặc gian lận.';
    case 'harassment':
      return 'Người dùng báo cáo bài viết có nội dung quấy rối, thù ghét hoặc gây phiền toái.';
    case 'violence':
      return 'Người dùng báo cáo bài viết có yếu tố bạo lực, phản cảm hoặc không phù hợp cộng đồng.';
    case 'intellectual_property':
      return 'Người dùng báo cáo bài viết có thể vi phạm bản quyền, thương hiệu hoặc nội dung của người khác.';
    default:
      return 'Người dùng báo cáo bài viết có nội dung cần kiểm duyệt.';
  }
};

const reportPost = async (postId: string, reasonId: string): Promise<void> => {
  if (!postId) {
    throw new Error('Thiếu postId để báo cáo bài viết');
  }

  const reason = normalizeReportReason(reasonId);

  await ApiService.post<ApiResponse<unknown>, Record<string, string>>(`${REPORT_API_URL}/posts`, {
    postId,
    targetPostId: postId,
    reason,
    reasonId: reason,
    description: getReportDescription(reason),
  });
};

export const postService = {
  uploadImages,
  createPost,
  getAllPosts,
  getMyPosts,
  getPostsByUserId,
  getSavedPosts,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  deletePost,
  updatePost,
  sharePost,
  reportPost,
  privacyToVisibility,
};
