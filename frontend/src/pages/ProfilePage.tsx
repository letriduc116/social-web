import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Container } from '@mui/material';
import { useParams } from 'react-router-dom';

import HomeHeader from '../components/header/HomeHeader';
import ProfileHero from '../components/profile/ProfileHero';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileActions from '../components/profile/ProfileActions';
import ProfileTabs from '../components/profile/ProfileTabs';
import ProfileAboutCard from '../components/profile/ProfileAboutCard';
import ProfileUserListCard from '../components/profile/ProfileUserListCard';
import FeedPostCard from '../components/post/FeedPostCard';
import PostDetailModal from '../components/post/PostDetailModal';

import type { ProfileTabKey, UserProfileResponse } from '../types/user';
import type { PostItem } from '../types/post';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import { authStorage } from '../services/authStorage';
import '../styles/profile.css';

const createEmptyProfile = (): UserProfileResponse => ({
  userId: '',
  userName: '',
  fullName: '',
  avatarUrl: '',
  bio: '',
  isFollowing: false,
  followersCount: 0,
  followingCount: 0,
  postCount: 0,
  followers: [],
  followings: [],
  posts: [],
});

function ProfilePage() {
  const { userId: routeUserId } = useParams();

  const [activeTab, setActiveTab] = useState<ProfileTabKey>('posts');
  const [profile, setProfile] = useState<UserProfileResponse>(createEmptyProfile());
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [openPostDetail, setOpenPostDetail] = useState(false);

  const currentUserId = authStorage.getCurrentUserId();
  const currentUserName = authStorage.getCurrentUserName();
  const currentUserAvatarText = currentUserName.charAt(0).toUpperCase();

  const targetUserId = routeUserId || currentUserId;
  const isOwner = targetUserId === currentUserId;

  const selectedPost = posts.find((item) => item.id === selectedPostId) || null;

  useEffect(() => {
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

        setPosts(userPosts);

        setProfile({
          ...profileRes,
          followers: followersRes || [],
          followings: followingRes || [],
          postCount: userPosts.length,
          posts: [],
        });
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Không thể tải trang cá nhân');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [targetUserId]);

  const profileData = useMemo(
    () => ({
      ...profile,
      postCount: posts.length,
    }),
    [profile, posts],
  );

  const handleOpenPostDetail = (post: PostItem) => {
    setSelectedPostId(post.id);
    setOpenPostDetail(true);
  };

  const handleClosePostDetail = () => {
    setOpenPostDetail(false);
    setSelectedPostId(null);
  };

  const handleCommentClick = (event: React.MouseEvent, post: PostItem) => {
    event.stopPropagation();
    handleOpenPostDetail(post);
  };

  const updatePostInList = (updatedPost: PostItem) => {
    setPosts((prev) => prev.map((item) => (item.id === updatedPost.id ? updatedPost : item)));
  };

  const increaseCommentCount = (postId: string, amount = 1) => {
    setPosts((prev) =>
      prev.map((item) =>
        item.id === postId
          ? {
              ...item,
              comments: item.comments + amount,
            }
          : item,
      ),
    );
  };

  const handleToggleLikePost = async (event: React.MouseEvent, post: PostItem) => {
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
      alert(err instanceof Error ? err.message : 'Không thể thích bài viết');
    }
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

  return (
    <div className="ducky-page">
      <HomeHeader />

      <Container maxWidth="lg" className="profile-page-container">
        <Box className="profile-shell">
          <ProfileHero profile={profileData} />
          <ProfileStats profile={profileData} />
          <ProfileActions
            isOwner={isOwner}
            isFollowing={profileData.isFollowing}
            onFollowToggle={() => console.log('toggle follow')}
            onEditProfile={() => console.log('open edit profile')}
          />
          <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />
        </Box>

        <Box className="profile-main-layout">
          <Box className="profile-left-column">
            <ProfileAboutCard profile={profileData} />
          </Box>

          <Box className="profile-right-column">
            {activeTab === 'posts' && (
              <>
                {posts.length === 0 ? (
                  <Box className="profile-empty-posts">Chưa có bài viết nào</Box>
                ) : (
                  posts.map((post) => (
                    <FeedPostCard
                      key={post.id}
                      post={post}
                      onOpenDetail={handleOpenPostDetail}
                      onCommentClick={handleCommentClick}
                      onToggleLike={handleToggleLikePost}
                    />
                  ))
                )}
              </>
            )}

            {activeTab === 'followers' && (
              <ProfileUserListCard title="Người theo dõi" users={profileData.followers || []} />
            )}

            {activeTab === 'following' && (
              <ProfileUserListCard title="Đang theo dõi" users={profileData.followings || []} />
            )}
          </Box>
        </Box>
      </Container>

      <PostDetailModal
        open={openPostDetail}
        onClose={handleClosePostDetail}
        post={selectedPost}
        currentUserName={currentUserName}
        currentUserAvatarText={currentUserAvatarText}
        onPostUpdated={updatePostInList}
        onCommentAdded={() => {
          if (selectedPostId) {
            increaseCommentCount(selectedPostId, 1);
          }
        }}
      />
    </div>
  );
}

export default ProfilePage;
