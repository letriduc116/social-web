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
import PostList from '../components/post/PostList';

import type { ProfileTabKey, UserProfileResponse, ProfilePost } from '../types/user';
import type { PostItem } from '../types/post';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import '../styles/profile.css';

const mapPostItemToProfilePost = (post: PostItem): ProfilePost => {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createAt,
    likeCount: post.likes,
    commentCount: post.comments,
    userId: post.user?.id || '',
    userName: post.user?.userName || post.user?.fullName || '',
    avatarUrl: post.user?.profileImage || '',
    imageUrls: (post.images || []).map((img) => ({
      id: img.id,
      urlImage: img.urlImage,
    })),
  };
};

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUserId = postService.getCurrentUserId();
  const targetUserId = routeUserId || currentUserId;
  const isOwner = targetUserId === currentUserId;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError('');

        const [profileRes, followersRes, followingRes] = await Promise.all([
          userService.getProfile(targetUserId),
          userService.getFollowers(targetUserId),
          userService.getFollowing(targetUserId),
        ]);

        let posts: ProfilePost[] = [];

        if (isOwner) {
          const myPosts = await postService.getMyPosts(targetUserId);
          posts = myPosts.map(mapPostItemToProfilePost);
        }

        setProfile({
          ...profileRes,
          followers: followersRes || [],
          followings: followingRes || [],
          posts,
          postCount: posts.length,
        });
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Không thể tải trang cá nhân');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [targetUserId, isOwner]);

  const profileData = useMemo(() => profile, [profile]);

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
            {activeTab === 'posts' && <PostList posts={profileData.posts} />}

            {activeTab === 'followers' && (
              <ProfileUserListCard title="Người theo dõi" users={profileData.followers || []} />
            )}

            {activeTab === 'following' && (
              <ProfileUserListCard title="Đang theo dõi" users={profileData.followings || []} />
            )}
          </Box>
        </Box>
      </Container>
    </div>
  );
}

export default ProfilePage;
