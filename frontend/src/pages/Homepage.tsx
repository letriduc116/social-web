import { useState } from 'react';
import { Avatar, Box, Button, Divider, IconButton, Paper, Typography } from '@mui/material';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import ThumbUpOffAltOutlinedIcon from '@mui/icons-material/ThumbUpOffAltOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { useNavigate } from 'react-router-dom';

import HomeHeader from '../components/header/HomeHeader';
import LeftSidebar from '../components/sidebar/LeftSidebar';
import RightSidebar from '../components/sidebar/RightSidebar';
import CreatePostModal from '../components/post/CreatePostModal';
import { postService } from '../services/postService';
import type { CreatePostModalPayload } from '../types/post';
import '../styles/homepage.css';

const posts = [
  {
    author: 'Ducky Team',
    time: '2 giờ trước',
    content: 'Chào mừng bạn đến với Ducky! Kết nối với bạn bè, chia sẻ khoảnh khắc và lan tỏa năng lượng tích cực.',
  },
  {
    author: 'Vịt Vàng',
    time: '5 giờ trước',
    content: 'Hôm nay trời đẹp quá, ai đi dạo hồ cùng mình không?',
  },
];

function Homepage() {
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const navigate = useNavigate();

  const currentUserName = postService.getCurrentUserDisplayName();
  const currentUserAvatarText = currentUserName.charAt(0).toUpperCase();

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

          {posts.map((post) => (
            <Paper className="fb-post-card" elevation={1} key={`${post.author}-${post.time}`}>
              <Box className="fb-post-header">
                <Box className="fb-post-author">
                  <Avatar sx={{ bgcolor: '#1976d2' }}>{post.author.charAt(0)}</Avatar>
                  <Box>
                    <Typography fontWeight={700}>{post.author}</Typography>
                    <Box className="fb-post-meta">
                      <span>{post.time}</span>
                      <PublicOutlinedIcon fontSize="inherit" />
                    </Box>
                  </Box>
                </Box>

                <IconButton>
                  <MoreHorizOutlinedIcon />
                </IconButton>
              </Box>

              <Typography className="fb-post-content">{post.content}</Typography>

              <Box className="fb-post-stats">
                <span>24 lượt thích</span>
                <span>8 bình luận · 2 lượt chia sẻ</span>
              </Box>

              <Divider />

              <Box className="fb-post-actions">
                <Button startIcon={<ThumbUpOffAltOutlinedIcon />}>Thích</Button>
                <Button startIcon={<ChatBubbleOutlineOutlinedIcon />}>Bình luận</Button>
                <Button startIcon={<ShareOutlinedIcon />}>Chia sẻ</Button>
              </Box>
            </Paper>
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
    </div>
  );
}

export default Homepage;
