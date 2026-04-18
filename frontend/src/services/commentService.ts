import { ApiService, type ApiResponse } from './api';
import { authStorage } from './authStorage';
import type { CommentItem, CommentRequestBody, CreateCommentPayload, ModifyCommentPayload } from '../types/comment';

const API_URL = '/v1/comments';

const unwrap = <T>(response: ApiResponse<T> | T): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T;
  }
  return response as T;
};

const getCommentsByPost = async (postId: string): Promise<CommentItem[]> => {
  const response = await ApiService.get<ApiResponse<CommentItem[]> | CommentItem[]>(`${API_URL}/post/${postId}`, {
    currentUserId: authStorage.getCurrentUserId(),
  });

  return unwrap(response) || [];
};

const addComment = async (payload: CreateCommentPayload): Promise<CommentItem> => {
  const body: CommentRequestBody = {
    ...payload,
    senderId: authStorage.getCurrentUserId(),
  };

  const response = await ApiService.post<ApiResponse<CommentItem> | CommentItem, CommentRequestBody>(API_URL, body);
  return unwrap(response);
};

const modifyComment = async (payload: ModifyCommentPayload): Promise<CommentItem> => {
  const response = await ApiService.put<ApiResponse<CommentItem> | CommentItem, ModifyCommentPayload>(
    `${API_URL}/modify`,
    payload,
  );

  return unwrap(response);
};

const deleteComment = async (commentId: string): Promise<void> => {
  await ApiService.delete<ApiResponse<void>>(`${API_URL}/delete/${commentId}`);
};

const toggleLikeComment = async (commentId: string): Promise<CommentItem> => {
  const response = await ApiService.post<ApiResponse<CommentItem> | CommentItem>(`${API_URL}/${commentId}/like`, null, {
    params: { userId: authStorage.getCurrentUserId() },
  });

  return unwrap(response);
};

export const commentService = {
  getCommentsByPost,
  addComment,
  modifyComment,
  deleteComment,
  toggleLikeComment,
};
