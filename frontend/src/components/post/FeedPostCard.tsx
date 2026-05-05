import { Avatar, Box, Button, Divider, IconButton, Paper, Typography } from '@mui/material';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import ThumbUpOffAltOutlinedIcon from '@mui/icons-material/ThumbUpOffAltOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import type { FeedPostCardProps } from '../../types/component';
import type { PostItem, PostVisibility } from '../../types/post';

function formatTime(value?: string) {
  if (!value) return 'Vừa xong';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
}

function getVisibilityMeta(visibility?: PostVisibility) {
  switch (visibility) {
    case 'FRIENDS':
      return {
        label: 'Bạn bè',
        icon: <PeopleAltOutlinedIcon fontSize="inherit" />,
      };
    case 'ONLY_ME':
      return {
        label: 'Chỉ mình tôi',
        icon: <LockOutlinedIcon fontSize="inherit" />,
      };
    case 'EVERYONE':
    default:
      return {
        label: 'Mọi người',
        icon: <PublicOutlinedIcon fontSize="inherit" />,
      };
  }
}

function getPostAuthorName(post?: PostItem | null) {
  return post?.user?.fullName || post?.user?.userName || 'Người dùng';
}

function renderSharedPostPreview(sharedPost?: PostItem | null) {
  if (!sharedPost) return null;

  return (
    <Box
      className="fb-shared-post-preview"
      sx={{
        mt: 1.5,
        border: '1px solid #dadde1',
        borderRadius: '12px',
        overflow: 'hidden',
        bgcolor: '#fff',
      }}
    >
      {sharedPost.images?.length > 0 ? (
        <Box className={`profile-post-image-grid ${sharedPost.images.length === 1 ? 'single' : ''}`}>
          {sharedPost.images.map((img, index) => (
            <div key={img.id || index} className="profile-post-image-item">
              <img src={img.urlImage} alt={`shared-post-${index}`} />
            </div>
          ))}
        </Box>
      ) : null}

      <Box sx={{ p: 1.5 }}>
        <Box className="fb-post-author" sx={{ mb: 1 }}>
          <Avatar src={sharedPost.user?.profileImage} sx={{ bgcolor: '#1976d2', width: 36, height: 36 }}>
            {getPostAuthorName(sharedPost).charAt(0)}
          </Avatar>

          <Box>
            <Typography fontWeight={700}>{getPostAuthorName(sharedPost)}</Typography>
            <Box className="fb-post-meta">
              <span>{formatTime(sharedPost.createAt)}</span>
              {getVisibilityMeta(sharedPost.visibility).icon}
            </Box>
          </Box>
        </Box>

        {sharedPost.content ? <Typography className="fb-post-content">{sharedPost.content}</Typography> : null}
      </Box>
    </Box>
  );
}

function FeedPostCard({ post, onOpenDetail, onCommentClick, onToggleLike, onShareClick }: FeedPostCardProps) {
  const visibilityMeta = getVisibilityMeta(post.visibility);
  const isShare = Boolean(post.shared || post.sharedPost);

  return (
    <Paper className="fb-post-card fb-post-card-clickable" elevation={1} onClick={() => onOpenDetail(post)}>
      <Box className="fb-post-header">
        <Box className="fb-post-author">
          <Avatar src={post.user?.profileImage} sx={{ bgcolor: '#1976d2' }}>
            {(post.user?.fullName || post.user?.userName || 'U').charAt(0)}
          </Avatar>

          <Box>
            <Typography fontWeight={700}>{post.user?.fullName || post.user?.userName || 'Người dùng'}</Typography>

            {isShare && post.sharedPost ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: -0.2 }}>
                đã chia sẻ bài viết của {getPostAuthorName(post.sharedPost)}
              </Typography>
            ) : null}

            <Box className="fb-post-meta">
              <span>{formatTime(post.createAt)}</span>
              {visibilityMeta.icon}
            </Box>
          </Box>
        </Box>

        <IconButton onClick={(e) => e.stopPropagation()}>
          <MoreHorizOutlinedIcon />
        </IconButton>
      </Box>

      {post.content ? <Typography className="fb-post-content">{post.content}</Typography> : null}

      {post.images?.length > 0 && (
        <Box className={`profile-post-image-grid ${post.images.length === 1 ? 'single' : ''}`}>
          {post.images.map((img, index) => (
            <div key={img.id || index} className="profile-post-image-item">
              <img src={img.urlImage} alt={`post-${index}`} />
            </div>
          ))}
        </Box>
      )}

      {post.sharedPost ? renderSharedPostPreview(post.sharedPost) : null}

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

        <Button startIcon={<ShareOutlinedIcon />} onClick={(e) => onShareClick?.(e, post)}>
          Chia sẻ
        </Button>
      </Box>
    </Paper>
  );
}

export default FeedPostCard;
