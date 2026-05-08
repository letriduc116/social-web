import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Alert, Box, CircularProgress, Container, Snackbar } from '@mui/material';
import { useParams } from 'react-router-dom';

import HomeHeader from '../components/header/HomeHeader';
import CreatePostModal from '../components/post/CreatePostModal';
import FeedPostCard from '../components/post/FeedPostCard';
import PostDetailModal from '../components/post/PostDetailModal';
import ProfileAboutCard from '../components/profile/ProfileAboutCard';
import ProfileActions from '../components/profile/ProfileActions';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import ProfileEmptyState from '../components/profile/ProfileEmptyState';
import ProfileHero from '../components/profile/ProfileHero';
import ProfilePhotosCard from '../components/profile/ProfilePhotosCard';
import ProfilePostComposer from '../components/profile/ProfilePostComposer';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileTabs from '../components/profile/ProfileTabs';
import ProfileTimelineHeader from '../components/profile/ProfileTimelineHeader';
import ProfileUserListCard from '../components/profile/ProfileUserListCard';
import SharePostModal from '../components/post/SharePostModal';

import type { CreatePostModalPayload, PostItem, SharePostModalPayload } from '../types/post';
import type { ProfileTabKey, UserProfileResponse } from '../types/user';
import { authStorage } from '../services/authStorage';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import '../styles/profile.css';

const createEmptyProfile = (): UserProfileResponse => ({
  userId: '',
  userName: '',
  fullName: '',
  avatarUrl: '',
  coverUrl: '',
  bio: '',
  isFollowing: false,
  followersCount: 0,
  followingCount: 0,
  postCount: 0,
  followers: [],
  followings: [],
  posts: [],
});

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

function ProfilePage() {
  const { userId: routeUserId } = useParams();

  const [activeTab, setActiveTab] = useState<ProfileTabKey>('posts');
  const [profile, setProfile] = useState<UserProfileResponse>(createEmptyProfile());
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [openPostDetail, setOpenPostDetail] = useState(false);
  const [openCreatePost, setOpenCreatePost] = useState(false);

  const [openSharePost, setOpenSharePost] = useState(false);
  const [sharingPost, setSharingPost] = useState<PostItem | null>(null);
  const [sharingSubmitting, setSharingSubmitting] = useState(false);

  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  const currentUserId = authStorage.getCurrentUserId();
  const currentUserName = authStorage.getCurrentUserName();
  const currentUserAvatarText = currentUserName.charAt(0).toUpperCase();

  const targetUserId = routeUserId || currentUserId;
  const isOwner = targetUserId === currentUserId;
  const selectedPost = posts.find((item) => item.id === selectedPostId) || null;

  const handleOpenSharePost = (post: PostItem) => {
    setSharingPost(post.sharedPost || post);
    setOpenSharePost(true);
  };

  const handleShareClick = (event: MouseEvent, post: PostItem) => {
    event.stopPropagation();
    handleOpenSharePost(post);
  };

  const handleCloseSharePost = () => {
    if (sharingSubmitting) return;

    setOpenSharePost(false);
    setSharingPost(null);
  };

  const handleSharePost = async (payload: SharePostModalPayload) => {
    if (!sharingPost) return;

    try {
      setSharingSubmitting(true);

      await postService.sharePost(sharingPost, payload);

      setOpenSharePost(false);
      setSharingPost(null);
      setToast('Đã chia sẻ bài viết');

      await reloadPostsOnly();
    } catch (err) {
      console.error(err);
      setToast(getErrorMessage(err, 'Chia sẻ bài viết thất bại'));
      throw err;
    } finally {
      setSharingSubmitting(false);
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');

      const [profileRes, followersRes, followingRes, userPosts] = await Promise.all([
        userService.getProfile(targetUserId),
        userService.getFollowers(targetUserId),
        userService.getFollowing(targetUserId),
        postService.getPostsByUserId(targetUserId),
      ]);

      setPosts(userPosts || []);
      setProfile({
        ...profileRes,
        followers: followersRes || [],
        followings: followingRes || [],
        postCount: userPosts?.length || 0,
        posts: [],
      });
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, 'Không thể tải trang cá nhân'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveTab('posts');
    setFriendRequestSent(false);
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId]);

  const profileData = useMemo(
    () => ({
      ...profile,
      postCount: posts.length,
    }),
    [profile, posts],
  );

  const updatePostInList = (updatedPost: PostItem) => {
    setPosts((prev) => prev.map((item) => (item.id === updatedPost.id ? updatedPost : item)));
  };

  const removePostFromList = (postId: string) => {
    setPosts((prev) => prev.filter((item) => item.id !== postId));
  };

  const increaseCommentCount = (postId: string, amount = 1) => {
    setPosts((prev) =>
      prev.map((item) =>
        item.id === postId
          ? {
              ...item,
              comments: Math.max(0, item.comments + amount),
            }
          : item,
      ),
    );
  };

  const reloadPostsOnly = async () => {
    const userPosts = await postService.getPostsByUserId(targetUserId);
    setPosts(userPosts || []);
    setProfile((prev) => ({ ...prev, postCount: userPosts?.length || 0 }));
  };

  const handleOpenPostDetail = (post: PostItem) => {
    setSelectedPostId(post.id);
    setOpenPostDetail(true);
  };

  const handleClosePostDetail = () => {
    setOpenPostDetail(false);
    setSelectedPostId(null);
  };

  const handleCommentClick = (event: MouseEvent, post: PostItem) => {
    event.stopPropagation();
    handleOpenPostDetail(post);
  };

  const handleToggleLikePost = async (event: MouseEvent, post: PostItem) => {
    event.stopPropagation();

    const optimisticPost: PostItem = {
      ...post,
      liked: !post.liked,
      likes: post.liked ? Math.max(0, post.likes - 1) : post.likes + 1,
    };

    updatePostInList(optimisticPost);

    try {
      if (post.liked) {
        await postService.unlikePost(post.id);
      } else {
        await postService.likePost(post.id);
      }
    } catch (err) {
      console.error(err);
      updatePostInList(post);
      setToast(getErrorMessage(err, 'Không thể thích bài viết'));
    }
  };

  const handleCreatePost = async (payload: CreatePostModalPayload) => {
    await postService.createPost(payload);
    await reloadPostsOnly();
    setToast('Đã đăng bài viết');
  };

  const handleUpdateProfile = async (payload: { fullName: string; userName: string; bio: string }) => {
    await userService.updateProfile(currentUserId, payload);
    setProfile((prev) => ({
      ...prev,
      fullName: payload.fullName,
      userName: payload.userName,
      bio: payload.bio,
    }));
    setToast('Đã cập nhật trang cá nhân');
  };

  const handleChangeAvatar = async (file: File) => {
    if (!isOwner || avatarUploading) return;

    try {
      setAvatarUploading(true);
      const imageUrl = await userService.uploadProfileImage(currentUserId, file);
      setProfile((prev) => ({
        ...prev,
        avatarUrl: imageUrl,
      }));
      setToast('Đã cập nhật ảnh đại diện');
    } catch (err) {
      console.error(err);
      setToast(getErrorMessage(err, 'Không thể cập nhật ảnh đại diện'));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChangeCover = async (file: File) => {
    if (!isOwner || coverUploading) return;

    try {
      setCoverUploading(true);
      const imageUrl = await userService.uploadCoverImage(currentUserId, file);
      setProfile((prev) => ({
        ...prev,
        coverUrl: imageUrl,
      }));
      setToast('Đã cập nhật ảnh bìa');
    } catch (err) {
      console.error(err);
      setToast(getErrorMessage(err, 'Không thể cập nhật ảnh bìa'));
    } finally {
      setCoverUploading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (isOwner || followLoading) return;

    const wasFollowing = profileData.isFollowing;

    try {
      setFollowLoading(true);

      if (wasFollowing) {
        await userService.unfollowUser(currentUserId, targetUserId);
      } else {
        await userService.followUser(currentUserId, targetUserId);
      }

      setProfile((prev) => ({
        ...prev,
        isFollowing: !wasFollowing,
        followersCount: wasFollowing ? Math.max(0, prev.followersCount - 1) : prev.followersCount + 1,
      }));

      setToast(wasFollowing ? 'Đã bỏ theo dõi' : 'Đã theo dõi');
    } catch (err) {
      console.error(err);
      setToast(getErrorMessage(err, 'Không thể cập nhật theo dõi'));
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    setToast('Tính năng nhắn tin có thể nối vào module chat của bạn sau.');
  };

  if (loading) {
    return (
      <div className="ducky-page">
        <HomeHeader />
        <Container maxWidth="lg" className="profile-page-container">
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ducky-page">
        <HomeHeader />
        <Container maxWidth="lg" className="profile-page-container">
          <Alert severity="error">{error}</Alert>
        </Container>
      </div>
    );
  }

  const renderRightColumn = () => {
    if (activeTab === 'followers') {
      return <ProfileUserListCard title="Người theo dõi" users={profileData.followers || []} />;
    }

    if (activeTab === 'following') {
      return <ProfileUserListCard title="Đang theo dõi" users={profileData.followings || []} />;
    }

    if (activeTab === 'about') {
      return (
        <ProfileAboutCard profile={profileData} isOwner={isOwner} onEditProfile={() => setOpenEditProfile(true)} />
      );
    }

    return (
      <>
        <ProfilePostComposer profile={profileData} isOwner={isOwner} onOpenCreatePost={() => setOpenCreatePost(true)} />
        <ProfileTimelineHeader isOwner={isOwner} />

        {posts.length === 0 ? (
          <ProfileEmptyState isOwner={isOwner} onCreatePost={() => setOpenCreatePost(true)} />
        ) : (
          posts.map((post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              onOpenDetail={handleOpenPostDetail}
              onCommentClick={handleCommentClick}
              onToggleLike={handleToggleLikePost}
              onShareClick={handleShareClick}
              onPostUpdated={updatePostInList}
              onPostDeleted={removePostFromList}
            />
          ))
        )}
      </>
    );
  };

  return (
    <div className="ducky-page">
      <HomeHeader />

      <Box className="profile-top-background">
        <Container maxWidth="lg" className="profile-page-container">
          <Box className="profile-shell">
            <ProfileHero
              profile={profileData}
              isOwner={isOwner}
              onChangeAvatar={handleChangeAvatar}
              onChangeCover={handleChangeCover}
              avatarUploading={avatarUploading}
              coverUploading={coverUploading}
            >
              <ProfileActions
                isOwner={isOwner}
                isFollowing={profileData.isFollowing}
                friendRequestSent={friendRequestSent}
                loading={followLoading}
                onFollowToggle={handleFollowToggle}
                onEditProfile={() => setOpenEditProfile(true)}
                onMessage={handleMessage}
              />
            </ProfileHero>

            <ProfileStats profile={profileData} onSelectTab={setActiveTab} />
            <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" className="profile-content-container">
        <Box className="profile-main-layout">
          <Box className="profile-left-column">
            <ProfileAboutCard profile={profileData} isOwner={isOwner} onEditProfile={() => setOpenEditProfile(true)} />
            <ProfilePhotosCard posts={posts} />
            <ProfileUserListCard
              title={isOwner ? 'Người theo dõi' : 'Một số người theo dõi'}
              users={profileData.followers || []}
              compact
              maxItems={6}
              onViewAll={() => setActiveTab('followers')}
            />
          </Box>

          <Box className="profile-right-column">{renderRightColumn()}</Box>
        </Box>
      </Container>

      <CreatePostModal
        open={openCreatePost}
        onClose={() => setOpenCreatePost(false)}
        onSubmit={handleCreatePost}
        userName={currentUserName}
        userAvatarText={currentUserAvatarText}
      />

      <SharePostModal
        open={openSharePost}
        onClose={handleCloseSharePost}
        post={sharingPost}
        onSubmit={handleSharePost}
        userName={currentUserName}
        userAvatarText={currentUserAvatarText}
      />

      <ProfileEditModal
        open={openEditProfile}
        profile={profileData}
        onClose={() => setOpenEditProfile(false)}
        onSubmit={handleUpdateProfile}
      />

      <PostDetailModal
        open={openPostDetail}
        onClose={handleClosePostDetail}
        post={selectedPost}
        currentUserName={currentUserName}
        currentUserAvatarText={currentUserAvatarText}
        onPostUpdated={updatePostInList}
        onPostDeleted={removePostFromList}
        onCommentAdded={() => {
          if (selectedPostId) {
            increaseCommentCount(selectedPostId, 1);
          }
        }}
        onShareClick={(post) => {
          setOpenPostDetail(false);
          handleOpenSharePost(post);
        }}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2800}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
}

export default ProfilePage;
