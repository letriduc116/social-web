import { Avatar, Box, Button, Divider, IconButton, Paper, Typography } from '@mui/material';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import ThumbUpOffAltOutlinedIcon from '@mui/icons-material/ThumbUpOffAltOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import type { FeedPostCardProps } from '../../types/component';

function formatTime(value?: string) {
  if (!value) return 'Vừa xong';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
}

function FeedPostCard({ post, onOpenDetail, onCommentClick, onToggleLike }: FeedPostCardProps) {
  return (
    <Paper className="fb-post-card fb-post-card-clickable" elevation={1} onClick={() => onOpenDetail(post)}>
      <Box className="fb-post-header">
        <Box className="fb-post-author">
          <Avatar src={post.user?.profileImage} sx={{ bgcolor: '#1976d2' }}>
            {(post.user?.fullName || post.user?.userName || 'U').charAt(0)}
          </Avatar>

          <Box>
            <Typography fontWeight={700}>{post.user?.fullName || post.user?.userName || 'Người dùng'}</Typography>

            <Box className="fb-post-meta">
              <span>{formatTime(post.createAt)}</span>
              <PublicOutlinedIcon fontSize="inherit" />
            </Box>
          </Box>
        </Box>

        <IconButton onClick={(e) => e.stopPropagation()}>
          <MoreHorizOutlinedIcon />
        </IconButton>
      </Box>

      <Typography className="fb-post-content">{post.content}</Typography>

      {post.images?.length > 0 && (
        <Box className={`profile-post-image-grid ${post.images.length === 1 ? 'single' : ''}`}>
          {post.images.map((img, index) => (
            <div key={img.id || index} className="profile-post-image-item">
              <img src={img.urlImage} alt={`post-${index}`} />
            </div>
          ))}
        </Box>
      )}

      <Box className="fb-post-stats">
        <span>{post.likes} lượt thích</span>
        <span>{post.comments} bình luận</span>
      </Box>

      <Divider />

      <Box className="fb-post-actions" onClick={(e) => e.stopPropagation()}>
        <Button
          className={post.liked ? 'fb-post-action-liked' : ''}
          startIcon={post.liked ? <ThumbUpAltOutlinedIcon /> : <ThumbUpOffAltOutlinedIcon />}
          onClick={(e) => onToggleLike(e, post)}
        >
          {post.liked ? 'Đã thích' : 'Thích'}
        </Button>

        <Button startIcon={<ChatBubbleOutlineOutlinedIcon />} onClick={(e) => onCommentClick(e, post)}>
          Bình luận
        </Button>

        <Button startIcon={<ShareOutlinedIcon />}>Chia sẻ</Button>
      </Box>
    </Paper>
  );
}

export default FeedPostCard;
