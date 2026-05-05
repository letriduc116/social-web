import { Avatar, Box, Button, Divider, IconButton, Paper, Typography } from '@mui/material';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import ThumbUpOffAltOutlinedIcon from '@mui/icons-material/ThumbUpOffAltOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import type { ProfilePost } from '../../types/user';
import type { PostVisibility } from '../../types/post';

type Props = {
  post: ProfilePost;
};

function formatTime(value?: string) {
  if (!value) return 'Vừa xong';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
}

function getVisibilityIcon(visibility?: PostVisibility) {
  switch (visibility) {
    case 'FRIENDS':
      return <PeopleAltOutlinedIcon fontSize="inherit" />;
    case 'ONLY_ME':
      return <LockOutlinedIcon fontSize="inherit" />;
    case 'EVERYONE':
    default:
      return <PublicOutlinedIcon fontSize="inherit" />;
  }
}

function getPostAuthorName(post?: ProfilePost | null) {
  return post?.userName || 'Người dùng';
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
            {post.shared && post.sharedPost ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: -0.2 }}>
                đã chia sẻ bài viết của {getPostAuthorName(post.sharedPost)}
              </Typography>
            ) : null}
            <Box className="fb-post-meta">
              <span>{formatTime(post.createdAt)}</span>
              {getVisibilityIcon(post.visibility)}
            </Box>
          </Box>
        </Box>

        <IconButton>
          <MoreHorizOutlinedIcon />
        </IconButton>
      </Box>

      {post.content ? <Typography className="fb-post-content">{post.content}</Typography> : null}

      {post.imageUrls?.length > 0 && (
        <Box className={`profile-post-image-grid ${post.imageUrls.length === 1 ? 'single' : ''}`}>
          {post.imageUrls.map((img, index) => (
            <div key={img.id || index} className="profile-post-image-item">
              <img src={img.urlImage} alt={`post-${index}`} />
            </div>
          ))}
        </Box>
      )}

      {post.sharedPost ? (
        <Box sx={{ mt: 1.5, border: '1px solid #dadde1', borderRadius: '12px', overflow: 'hidden' }}>
          {post.sharedPost.imageUrls?.length > 0 ? (
            <Box className={`profile-post-image-grid ${post.sharedPost.imageUrls.length === 1 ? 'single' : ''}`}>
              {post.sharedPost.imageUrls.map((img, index) => (
                <div key={img.id || index} className="profile-post-image-item">
                  <img src={img.urlImage} alt={`shared-post-${index}`} />
                </div>
              ))}
            </Box>
          ) : null}

          <Box sx={{ p: 1.5 }}>
            <Typography fontWeight={700}>{getPostAuthorName(post.sharedPost)}</Typography>
            {post.sharedPost.content ? <Typography className="fb-post-content">{post.sharedPost.content}</Typography> : null}
          </Box>
        </Box>
      ) : null}

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
