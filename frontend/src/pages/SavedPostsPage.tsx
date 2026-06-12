import { useEffect, useState, type MouseEvent } from 'react';
import { Alert, Box, Button, Divider, Paper, Skeleton, Typography } from '@mui/material';
import BookmarkAddedOutlinedIcon from '@mui/icons-material/BookmarkAddedOutlined';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { useNavigate } from 'react-router-dom';

import HomeHeader from '../components/header/HomeHeader';
import LeftSidebar from '../components/sidebar/LeftSidebar';
import FeedPostCard from '../components/post/FeedPostCard';
import PostDetailModal from '../components/post/PostDetailModal';
import SharePostModal from '../components/post/SharePostModal';

import { postService } from '../services/postService';
import { authStorage } from '../services/authStorage';
import type { PostItem, SharePostModalPayload } from '../types/post';
import '../styles/homepage.css';

function SavedPostSkeleton() {
  return (
    <Paper className="fb-post-card saved-post-skeleton" elevation={1}>
      <Box className="fb-post-author">
        <Skeleton variant="circular" width={42} height={42} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="38%" height={24} />
          <Skeleton variant="text" width="24%" height={18} />
        </Box>
      </Box>

      <Skeleton variant="text" width="80%" height={26} sx={{ mt: 2 }} />
      <Skeleton variant="rounded" width="100%" height={260} sx={{ mt: 1.5, borderRadius: '12px' }} />
    </Paper>
  );
}

function SavedPostsInfoPanel({ total }: { total: number }) {
  return (
    <aside className="saved-posts-panel right-sidebar" aria-label="Saved posts info">
      <Paper className="ducky-sidebar saved-posts-summary-card" elevation={0}>
        <Box className="saved-posts-summary-icon">
          <CollectionsBookmarkOutlinedIcon />
        </Box>

        <Typography variant="h6" fontWeight={800}>
          Kho lưu của bạn
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Bạn đang có <strong>{total}</strong> bài viết đã lưu.
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Box className="saved-posts-tip-row">
          <TipsAndUpdatesOutlinedIcon />
          <Typography variant="body2" color="text.secondary">
            Bấm nút ba chấm trên bài viết rồi chọn “Bỏ lưu bài viết” để xoá khỏi danh sách này.
          </Typography>
        </Box>
      </Paper>
    </aside>
  );
}

function SavedPostsPage() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState('');

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [openPostDetail, setOpenPostDetail] = useState(false);

  const [openSharePost, setOpenSharePost] = useState(false);
  const [sharingPost, setSharingPost] = useState<PostItem | null>(null);
  const [sharingSubmitting, setSharingSubmitting] = useState(false);

  const currentUserName = authStorage.getCurrentUserName();
  const currentUserAvatarText = currentUserName.charAt(0).toUpperCase();

  const selectedPost = posts.find((item) => item.id === selectedPostId) || null;

  const fetchSavedPosts = async () => {
    try {
      setLoadingPosts(true);
      setPostsError('');

      const response = await postService.getSavedPosts();
      setPosts(response);
    } catch (error) {
      console.error(error);
      setPostsError(error instanceof Error ? error.message : 'Không tải được danh sách bài viết đã lưu');
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const handleOpenPostDetail = (post: PostItem) => {
    setSelectedPostId(post.id);
    setOpenPostDetail(true);
  };

  const handleClosePostDetail = () => {
    setOpenPostDetail(false);
    setSelectedPostId(null);
  };

  const updatePostInList = (updatedPost: PostItem) => {
    setPosts((prev) => {
      if (!updatedPost.savedPost) {
        return prev.filter((item) => item.id !== updatedPost.id);
      }

      const existed = prev.some((item) => item.id === updatedPost.id);

      if (!existed) {
        return [updatedPost, ...prev];
      }

      return prev.map((item) => (item.id === updatedPost.id ? updatedPost : item));
    });

    if (!updatedPost.savedPost && selectedPostId === updatedPost.id) {
      handleClosePostDetail();
    }
  };

  const removePostFromList = (postId: string) => {
    setPosts((prev) => prev.filter((item) => item.id !== postId));

    if (selectedPostId === postId) {
      handleClosePostDetail();
    }
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
    } catch (error) {
      console.error(error);
      updatePostInList(post);
      alert(error instanceof Error ? error.message : 'Không thể thích bài viết');
    }
  };

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
      alert('Chia sẻ bài viết thành công');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Chia sẻ bài viết thất bại');
      throw error;
    } finally {
      setSharingSubmitting(false);
    }
  };

  return (
    <div className="ducky-page">
      <HomeHeader />

      <main className="ducky-layout saved-posts-layout">
        <LeftSidebar />

        <section className="ducky-feed saved-posts-feed" aria-label="Saved posts">
          <Paper className="saved-posts-hero" elevation={1}>
            <Box className="saved-posts-hero-main">
              <Box className="saved-posts-hero-icon">
                <BookmarkAddedOutlinedIcon />
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="h5" className="saved-posts-title">
                  Bài viết đã lưu
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Xem lại những bài viết bạn đã lưu trên Ducky.
                </Typography>
              </Box>
            </Box>

            <Box className="saved-posts-hero-actions">
              <Button
                variant="outlined"
                startIcon={<RefreshOutlinedIcon />}
                onClick={fetchSavedPosts}
                disabled={loadingPosts}
                className="saved-posts-action-btn"
              >
                Làm mới
              </Button>

              <Button
                variant="contained"
                startIcon={<HomeOutlinedIcon />}
                onClick={() => navigate('/home')}
                className="saved-posts-action-btn"
              >
                Bảng tin
              </Button>
            </Box>
          </Paper>

          {loadingPosts && (
            <Box className="saved-posts-list">
              {Array.from({ length: 3 }).map((_, index) => (
                <SavedPostSkeleton key={index} />
              ))}
            </Box>
          )}

          {!loadingPosts && postsError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={fetchSavedPosts}>
                  Thử lại
                </Button>
              }
            >
              {postsError}
            </Alert>
          )}

          {!loadingPosts && !postsError && posts.length === 0 && (
            <Paper elevation={1} className="saved-posts-empty-card">
              <Box className="saved-posts-empty-icon">
                <BookmarkAddedOutlinedIcon />
              </Box>

              <Typography variant="h6" fontWeight={800}>
                Chưa có bài viết đã lưu
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 440 }}>
                Khi bạn bấm “Lưu bài viết”, bài viết đó sẽ được gom lại ở đây để xem lại nhanh hơn.
              </Typography>

              <Button variant="contained" startIcon={<HomeOutlinedIcon />} sx={{ mt: 2 }} onClick={() => navigate('/')}>
                Khám phá bảng tin
              </Button>
            </Paper>
          )}

          {!loadingPosts && !postsError && posts.length > 0 && (
            <Box className="saved-posts-list">
              {posts.map((post) => (
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
              ))}
            </Box>
          )}
        </section>

        <SavedPostsInfoPanel total={posts.length} />
      </main>

      <PostDetailModal
        open={openPostDetail}
        onClose={handleClosePostDetail}
        post={selectedPost}
        currentUserName={currentUserName}
        currentUserAvatarText={currentUserAvatarText}
        onPostUpdated={updatePostInList}
        onPostDeleted={removePostFromList}
        onCommentAdded={() => {
          if (selectedPostId) increaseCommentCount(selectedPostId, 1);
        }}
        onShareClick={(post) => {
          setOpenPostDetail(false);
          handleOpenSharePost(post);
        }}
      />

      <SharePostModal
        open={openSharePost}
        onClose={handleCloseSharePost}
        post={sharingPost}
        onSubmit={handleSharePost}
        userName={currentUserName}
        userAvatarText={currentUserAvatarText}
      />
    </div>
  );
}

export default SavedPostsPage;
