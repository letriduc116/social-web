import { Avatar, Box, Button, Divider, IconButton, Paper, Typography } from '@mui/material';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import ThumbUpOffAltOutlinedIcon from '@mui/icons-material/ThumbUpOffAltOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import type { ProfilePost } from '../../types/user';

type Props = {
  post: ProfilePost;
};

function formatTime(value?: string) {
  if (!value) return 'Vừa xong';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
}

function PostCard({ post }: Props) {
  return (
    <Paper className="fb-post-card" elevation={1}>
      <Box className="fb-post-header">
        <Box className="fb-post-author">
          <Avatar src={post.avatarUrl} sx={{ bgcolor: '#1976d2' }}>
            {post.userName?.charAt(0) || 'U'}
          </Avatar>

          <Box>
            <Typography fontWeight={700}>{post.userName || 'Người dùng'}</Typography>
            <Box className="fb-post-meta">
              <span>{formatTime(post.createdAt)}</span>
              <PublicOutlinedIcon fontSize="inherit" />
            </Box>
          </Box>
        </Box>

        <IconButton>
          <MoreHorizOutlinedIcon />
        </IconButton>
      </Box>

      <Typography className="fb-post-content">{post.content}</Typography>

      {post.imageUrls?.length > 0 && (
        <Box className={`profile-post-image-grid ${post.imageUrls.length === 1 ? 'single' : ''}`}>
          {post.imageUrls.map((img, index) => (
            <div key={img.id || index} className="profile-post-image-item">
              <img src={img.urlImage} alt={`post-${index}`} />
            </div>
          ))}
        </Box>
      )}

      <Box className="fb-post-stats">
        <span>{post.likeCount} lượt thích</span>
        <span>{post.commentCount} bình luận</span>
      </Box>

      <Divider />

      <Box className="fb-post-actions">
        <Button startIcon={<ThumbUpOffAltOutlinedIcon />}>Thích</Button>
        <Button startIcon={<ChatBubbleOutlineOutlinedIcon />}>Bình luận</Button>
        <Button startIcon={<ShareOutlinedIcon />}>Chia sẻ</Button>
      </Box>
    </Paper>
  );
}

export default PostCard;
