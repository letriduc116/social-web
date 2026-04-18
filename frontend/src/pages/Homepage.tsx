import { useEffect, useState } from 'react';
import { Alert, Avatar, Box, Button, CircularProgress, Divider, Paper } from '@mui/material';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import { useNavigate } from 'react-router-dom';

import HomeHeader from '../components/header/HomeHeader';
import LeftSidebar from '../components/sidebar/LeftSidebar';
import RightSidebar from '../components/sidebar/RightSidebar';
import CreatePostModal from '../components/post/CreatePostModal';
import PostDetailModal from '../components/post/PostDetailModal';
import FeedPostCard from '../components/post/FeedPostCard';

import { postService } from '../services/postService';
import { authStorage } from '../services/authStorage';
import type { CreatePostModalPayload, PostItem } from '../types/post';
import '../styles/homepage.css';

function Homepage() {
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState('');

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [openPostDetail, setOpenPostDetail] = useState(false);

  const navigate = useNavigate();

  // const currentUserId = authStorage.getCurrentUserId();
  const currentUserName = authStorage.getCurrentUserName();
  const currentUserAvatarText = currentUserName.charAt(0).toUpperCase();

  const selectedPost = posts.find((item) => item.id === selectedPostId) || null;

  const fetchFeedPosts = async () => {
    try {
      setLoadingPosts(true);
      setPostsError('');
      const response = await postService.getAllPosts();
      setPosts(response);
    } catch (error) {
      console.error(error);
      setPostsError(error instanceof Error ? error.message : 'Không tải được bảng tin');
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchFeedPosts();
  }, []);

  const handleOpenCreatePost = () => {
    setOpenCreatePost(true);
  };

  const handleCloseCreatePost = () => {
    if (creatingPost) return;
    setOpenCreatePost(false);
  };

  const handleCreatePost = async (payload: CreatePostModalPayload) => {
    try {
      setCreatingPost(true);
      await postService.createPost(payload);
      setOpenCreatePost(false);
      navigate('/profile');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Đăng bài thất bại');
      throw error;
    } finally {
      setCreatingPost(false);
    }
  };

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
    } catch (error) {
      console.error(error);
      updatePostInList(post);
      alert(error instanceof Error ? error.message : 'Không thể thích bài viết');
    }
  };

  return (
    <div className="ducky-page">
      <HomeHeader />

      <main className="ducky-layout">
        <LeftSidebar />

        <section className="ducky-feed" aria-label="News feed">
          <Paper className="fb-composer" elevation={1}>
            <Box className="fb-composer-top">
              <Avatar sx={{ bgcolor: '#90a4ae' }}>{currentUserAvatarText}</Avatar>

              <button type="button" className="fb-composer-trigger" onClick={handleOpenCreatePost}>
                Bạn đang nghĩ gì vậy, {currentUserName}?
              </button>
            </Box>

            <Divider />

            <Box className="fb-composer-actions">
              <Button startIcon={<VideocamOutlinedIcon />} onClick={handleOpenCreatePost}>
                Video trực tiếp
              </Button>
              <Button startIcon={<ImageOutlinedIcon />} onClick={handleOpenCreatePost}>
                Ảnh/video
              </Button>
              <Button startIcon={<EmojiEmotionsOutlinedIcon />} onClick={handleOpenCreatePost}>
                Cảm xúc/hoạt động
              </Button>
            </Box>
          </Paper>

          {loadingPosts && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {!loadingPosts && postsError && <Alert severity="error">{postsError}</Alert>}

          {!loadingPosts &&
            !postsError &&
            posts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                onOpenDetail={handleOpenPostDetail}
                onCommentClick={handleCommentClick}
                onToggleLike={handleToggleLikePost}
              />
            ))}
        </section>

        <RightSidebar />
      </main>

      <CreatePostModal
        open={openCreatePost}
        onClose={handleCloseCreatePost}
        onSubmit={handleCreatePost}
        userName={currentUserName}
        userAvatarText={currentUserAvatarText}
      />

      <PostDetailModal
        open={openPostDetail}
        onClose={handleClosePostDetail}
        post={selectedPost}
        currentUserName={currentUserName}
        currentUserAvatarText={currentUserAvatarText}
        onPostUpdated={updatePostInList}
        onCommentAdded={() => {
          if (selectedPostId) increaseCommentCount(selectedPostId, 1);
        }}
      />
    </div>
  );
}

export default Homepage;
