import { ApiService } from './api';
import type { ApiResponse } from './api';
import type { CreatePostModalPayload, CreatePostPayload, PostItem, SavedPostProfile } from '../types/post';

type LocalUser = {
  id: string;
  email?: string;
  userName?: string;
  fullName?: string;
  role?: string;
  accessToken?: string;
};

const getStoredUser = (): LocalUser | null => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as LocalUser;
  } catch {
    return null;
  }
};

export const postService = {
  getStoredUser,

  getCurrentUserId(): string {
    const user = getStoredUser();
    if (!user?.id) {
      throw new Error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại');
    }
    return user.id;
  },

  getCurrentUserDisplayName(): string {
    const user = getStoredUser();
    return user?.fullName || user?.userName || 'Người dùng';
  },

  async uploadImages(files: File[]): Promise<string[]> {
    if (!files.length) return [];

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await ApiService.upload<ApiResponse<string[]>>('/file/upload', formData, {
      baseURL: 'http://localhost:8080',
    });

    return response.data || [];
  },

  async createPost(payload: CreatePostModalPayload): Promise<string> {
    const user = getStoredUser();

    if (!user?.id) {
      throw new Error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại');
    }

    const uploadedUrls = await this.uploadImages(payload.files);

    const body: CreatePostPayload = {
      content: payload.content,
      postImages: uploadedUrls,
      user_Id: user.id,
    };

    const response = await ApiService.post<ApiResponse<string>, CreatePostPayload>('/v1/post', body);

    return response.data;
  },

  async getAllPosts(currentUserId: string): Promise<PostItem[]> {
    const response = await ApiService.get<ApiResponse<PostItem[]>>('/v1/post', {
      id: currentUserId,
    });

    return response.data || [];
  },

  async getMyPosts(currentUserId: string): Promise<PostItem[]> {
    const response = await ApiService.get<ApiResponse<PostItem[]>>('/v1/post/minePost', {
      id: currentUserId,
    });

    return response.data || [];
  },

  async getSavedPosts(userId: string): Promise<SavedPostProfile[]> {
    const response = await ApiService.get<ApiResponse<SavedPostProfile[]>>('/v1/post/saved', {
      userId,
    });

    return response.data || [];
  },
};
