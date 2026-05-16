import { ApiService } from './api';
import type { FriendRequestResponse, FriendshipStatusResponse } from '../types/friend';

type ApiWrap<T> = {
  status?: number;
  message?: string | null;
  data: T;
};

const API_URL = '/v1/friends';

const unwrap = <T>(response: ApiWrap<T> | T): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T;
  }

  return response as T;
};

const sendRequest = async (receiverId: string): Promise<FriendRequestResponse> => {
  const response = await ApiService.post<ApiWrap<FriendRequestResponse> | FriendRequestResponse>(
    `${API_URL}/requests`,
    null,
    {
      params: { receiverId },
    },
  );

  return unwrap(response);
};

const acceptRequest = async (requestId: string): Promise<FriendRequestResponse> => {
  const response = await ApiService.patch<ApiWrap<FriendRequestResponse> | FriendRequestResponse>(
    `${API_URL}/requests/${requestId}/accept`,
  );

  return unwrap(response);
};

const declineRequest = async (requestId: string): Promise<FriendRequestResponse> => {
  const response = await ApiService.patch<ApiWrap<FriendRequestResponse> | FriendRequestResponse>(
    `${API_URL}/requests/${requestId}/decline`,
  );

  return unwrap(response);
};

const cancelRequest = async (requestId: string): Promise<FriendRequestResponse> => {
  const response = await ApiService.patch<ApiWrap<FriendRequestResponse> | FriendRequestResponse>(
    `${API_URL}/requests/${requestId}/cancel`,
  );

  return unwrap(response);
};

const getFriendshipStatus = async (targetUserId: string): Promise<FriendshipStatusResponse> => {
  const response = await ApiService.get<ApiWrap<FriendshipStatusResponse> | FriendshipStatusResponse>(
    `${API_URL}/status`,
    {
      targetUserId,
    },
  );

  const data = unwrap(response);

  return {
    ...data,
    following: Boolean(data.following),
  };
};

const getReceivedRequests = async (): Promise<FriendRequestResponse[]> => {
  const response = await ApiService.get<ApiWrap<FriendRequestResponse[]> | FriendRequestResponse[]>(
    `${API_URL}/requests/received`,
  );

  const data = unwrap(response);
  return Array.isArray(data) ? data : [];
};

const unfriend = async (targetUserId: string): Promise<FriendshipStatusResponse> => {
  const response = await ApiService.delete<ApiWrap<FriendshipStatusResponse> | FriendshipStatusResponse>(
    `${API_URL}/${targetUserId}`,
  );

  const data = unwrap(response);

  return {
    ...data,
    following: Boolean(data.following),
  };
};

const unfollowFriend = async (targetUserId: string): Promise<FriendshipStatusResponse> => {
  const response = await ApiService.delete<ApiWrap<FriendshipStatusResponse> | FriendshipStatusResponse>(
    `${API_URL}/${targetUserId}/follow`,
  );

  const data = unwrap(response);

  return {
    ...data,
    following: Boolean(data.following),
  };
};

const followFriendAgain = async (targetUserId: string): Promise<FriendshipStatusResponse> => {
  const response = await ApiService.post<ApiWrap<FriendshipStatusResponse> | FriendshipStatusResponse>(
    `${API_URL}/${targetUserId}/follow`,
  );

  const data = unwrap(response);

  return {
    ...data,
    following: Boolean(data.following),
  };
};

export const friendService = {
  sendRequest,
  acceptRequest,
  declineRequest,
  cancelRequest,
  getFriendshipStatus,
  getReceivedRequests,
  unfriend,
  unfollowFriend,
  followFriendAgain,
};
