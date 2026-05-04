import { ApiService, type ApiResponse } from './api';
import { authStorage } from './authStorage';
import type {
  CreatePostModalPayload,
  CreatePostPayload,
  LikePostPayload,
  PostItem,
  SavedPostProfile,
} from '../types/post';

const API_URL = '/v1/post';
const LIKE_API_URL = '/v1/like';

const unwrap = <T>(response: ApiResponse<T> | T): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T;
  }
  return response as T;
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
  const currentUserId = authStorage.getCurrentUserId();

  if (userId === currentUserId) {
    return getMyPosts();
  }

  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.user?.id === userId);
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

export const postService = {
  uploadImages,
  createPost,
  getAllPosts,
  getMyPosts,
  getPostsByUserId,
  getSavedPosts,
  likePost,
  unlikePost,
};
