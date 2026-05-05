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

const unwrap = <T>(response: ApiResponse<T> | T): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T;
  }
  return response as T;
};

const mapPrivacyToVisibility = (privacy?: PostPrivacy): PostVisibility => {
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
    visibility: mapPrivacyToVisibility(payload.privacy),
  };

  const response = await ApiService.post<ApiResponse<string> | string, CreatePostPayload>(API_URL, body);
  return unwrap(response);
};

const sharePost = async (originalPostId: string, payload: SharePostModalPayload): Promise<PostItem> => {
  const body: SharePostPayload = {
    userId: authStorage.getCurrentUserId(),
    originalPostId,
    content: payload.content,
    visibility: mapPrivacyToVisibility(payload.privacy),
  };

  const response = await ApiService.post<ApiResponse<PostItem> | PostItem, SharePostPayload>(`${API_URL}/share`, body);
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
  const currentUserId = authStorage.getCurrentUserId();

  const response = await ApiService.get<ApiResponse<PostItem[]> | PostItem[]>(`${API_URL}/user`, {
    userId,
    viewerId: currentUserId,
  });

  return unwrap(response) || [];
};

const getSavedPosts = async (): Promise<SavedPostProfile[]> => {
  const response = await ApiService.get<ApiResponse<SavedPostProfile[]> | SavedPostProfile[]>(`${API_URL}/saved`, {
    userId: authStorage.getCurrentUserId(),
  });

  return unwrap(response) || [];
};


const updatePost = async (postId: string, payload: UpdatePostPayload): Promise<PostItem> => {
  const response = await ApiService.put<ApiResponse<PostItem> | PostItem, UpdatePostPayload>(`${API_URL}/update`, payload, {
    params: { postId },
  });

  return unwrap(response);
};

const deletePost = async (postId: string): Promise<void> => {
  await ApiService.delete<ApiResponse<null>>(API_URL, {
    params: { postId },
  });
};

const savePost = async (postId: string): Promise<void> => {
  await ApiService.post<ApiResponse<null>, { postId: string; userId: string }>(`${SAVED_POST_API_URL}/save`, {
    postId,
    userId: authStorage.getCurrentUserId(),
  });
};

const unsavePost = async (postId: string): Promise<void> => {
  await ApiService.delete<ApiResponse<null>>(`${SAVED_POST_API_URL}/delete`, {
    data: {
      postId,
      userId: authStorage.getCurrentUserId(),
    },
  });
};

const reportPost = async (postId: string, reasonId: string): Promise<void> => {
  // Hiện tại BE chưa có API report. Giữ dạng async để sau này thay bằng POST /v1/post/report.
  console.log('Report post:', { postId, reasonId });
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

export const postService = {
  uploadImages,
  createPost,
  sharePost,
  getAllPosts,
  getMyPosts,
  getPostsByUserId,
  getSavedPosts,
  updatePost,
  deletePost,
  savePost,
  unsavePost,
  reportPost,
  likePost,
  unlikePost,
};
