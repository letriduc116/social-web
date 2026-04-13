import type { UserProfileResponse } from '../types/user';

export const mockMyProfile: UserProfileResponse = {
  userId: 'u1',
  userName: 'triduc1164',
  fullName: 'Trí Đức',
  avatarUrl: '',
  bio: 'Những ngày không yêu...',
  isFollowing: false,
  followersCount: 120,
  followingCount: 95,
  postCount: 2,
  followers: [
    { id: 'u2', fullName: 'Minh Anh', profileImage: '' },
    { id: 'u3', fullName: 'Phan Lê', profileImage: '' },
    { id: 'u4', fullName: 'Tịnh Bùi', profileImage: '' },
  ],
  followings: [
    { id: 'u5', fullName: 'Nguyễn Hùng', profileImage: '' },
    { id: 'u6', fullName: 'Mỹ Thanh', profileImage: '' },
  ],
  posts: [
    {
      id: 'p1',
      content: 'Chào mọi người, đây là bài viết đầu tiên trên trang cá nhân của mình.',
      createdAt: '2026-04-01T09:00:00',
      likeCount: 24,
      commentCount: 8,
      userId: 'u1',
      userName: 'triduc1164',
      avatarUrl: '',
      imageUrls: [],
    },
    {
      id: 'p2',
      content: 'Hôm nay trời đẹp quá, ai đi dạo cùng mình không?',
      createdAt: '2026-04-01T06:00:00',
      likeCount: 12,
      commentCount: 5,
      userId: 'u1',
      userName: 'triduc1164',
      avatarUrl: '',
      imageUrls: [],
    },
  ],
};

export const mockOtherProfile: UserProfileResponse = {
  userId: 'u2',
  userName: 'minh.anh.283336',
  fullName: 'Minh Anh',
  avatarUrl: '',
  bio: 'Mỗi ngày là một niềm vui nhỏ',
  isFollowing: true,
  followersCount: 825,
  followingCount: 302,
  postCount: 1,
  followers: [
    { id: 'u1', fullName: 'Trí Đức', profileImage: '' },
    { id: 'u7', fullName: 'Lan Anh', profileImage: '' },
  ],
  followings: [{ id: 'u8', fullName: 'Như Quỳnh', profileImage: '' }],
  posts: [
    {
      id: 'p10',
      content: 'Một ngày bình yên.',
      createdAt: '2026-03-30T20:30:00',
      likeCount: 55,
      commentCount: 10,
      userId: 'u2',
      userName: 'minh.anh.283336',
      avatarUrl: '',
      imageUrls: [],
    },
  ],
};
