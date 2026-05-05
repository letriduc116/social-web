import { useMemo, useState } from 'react';
import { Avatar, Box, Button, Divider, Paper, Typography } from '@mui/material';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ThumbUpOffAltOutlinedIcon from '@mui/icons-material/ThumbUpOffAltOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import type { ProfilePost } from '../../types/user';
import type { PostItem, PostVisibility, UpdatePostPayload } from '../../types/post';
import { authStorage } from '../../services/authStorage';
import { postService } from '../../services/postService';
import PostOptionsMenu from './PostOptionsMenu';
import ReportPostModal from './ReportPostModal';
import DeletePostConfirmDialog from './DeletePostConfirmDialog';
import EditPostModal from './EditPostModal';

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

function profilePostToPostItem(post: ProfilePost): PostItem {
  return {
    id: post.id,
    content: post.content,
    createAt: post.createdAt,
    images: post.imageUrls || [],
    comments: post.commentCount || 0,
    likes: post.likeCount || 0,
    liked: false,
    savedPost: false,
    visibility: post.visibility,
    shared: post.shared,
    sharedPost: post.sharedPost ? profilePostToPostItem(post.sharedPost) : null,
    user: {
      id: post.userId,
      userName: post.userName,
      fullName: post.userName,
      profileImage: post.avatarUrl,
    },
  };
}

function PostCard({ post }: Props) {
  const [localPost, setLocalPost] = useState<PostItem>(() => profilePostToPostItem(post));
  const [hidden, setHidden] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [savingPost, setSavingPost] = useState(false);

  const isOwner = useMemo(() => {
    try {
      return authStorage.getCurrentUserId() === localPost.user?.id;
    } catch {
      return false;
    }
  }, [localPost.user?.id]);

  if (hidden) return null;

  const handleToggleSave = async () => {
    if (savingPost || isOwner) return;

    const previous = localPost;
    const optimistic = { ...localPost, savedPost: !localPost.savedPost };
    setLocalPost(optimistic);

    try {
      setSavingPost(true);
      if (localPost.savedPost) await postService.unsavePost(localPost.id);
      else await postService.savePost(localPost.id);
    } catch (error) {
      console.error(error);
      setLocalPost(previous);
      alert(error instanceof Error ? error.message : 'Không thể lưu bài viết');
    } finally {
      setSavingPost(false);
    }
  };

  const handleDelete = async () => {
    if (deletingPost || !isOwner) return;

    try {
      setDeletingPost(true);
      await postService.deletePost(localPost.id);
      setHidden(true);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Không thể xoá bài viết');
    } finally {
      setDeletingPost(false);
    }
  };

  const handleEdit = async (payload: UpdatePostPayload) => {
    if (editingPost || !isOwner) return;

    const previous = localPost;
    const optimistic = {
      ...localPost,
      content: payload.content ?? localPost.content,
      visibility: payload.visibility ?? localPost.visibility,
    };

    try {
      setEditingPost(true);
      setLocalPost(optimistic);
      const updated = await postService.updatePost(localPost.id, payload);
      setLocalPost(updated || optimistic);
      setOpenEdit(false);
    } catch (error) {
      console.error(error);
      setLocalPost(previous);
      alert(error instanceof Error ? error.message : 'Không thể chỉnh sửa bài viết');
    } finally {
      setEditingPost(false);
    }
  };

  return (
    <>
      <Paper className="fb-post-card" elevation={1}>
        <Box className="fb-post-header">
          <Box className="fb-post-author">
            <Avatar src={localPost.user?.profileImage} sx={{ bgcolor: '#1976d2' }}>
              {localPost.user?.userName?.charAt(0) || 'U'}
            </Avatar>

            <Box>
              <Typography fontWeight={700}>{localPost.user?.userName || 'Người dùng'}</Typography>
              {localPost.shared && post.sharedPost ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: -0.2 }}>
                  đã chia sẻ bài viết của {getPostAuthorName(post.sharedPost)}
                </Typography>
              ) : null}
              <Box className="fb-post-meta">
                <span>{formatTime(localPost.createAt)}</span>
                {getVisibilityIcon(localPost.visibility)}
              </Box>
            </Box>
          </Box>

          <PostOptionsMenu
            post={localPost}
            isOwner={isOwner}
            disabled={savingPost || deletingPost || editingPost}
            onEdit={() => setOpenEdit(true)}
            onDelete={() => setOpenDeleteConfirm(true)}
            onToggleSave={handleToggleSave}
            onReport={() => setOpenReport(true)}
            onHide={() => setHidden(true)}
          />
        </Box>

        {localPost.content ? <Typography className="fb-post-content">{localPost.content}</Typography> : null}

        {localPost.images?.length > 0 && (
          <Box className={`profile-post-image-grid ${localPost.images.length === 1 ? 'single' : ''}`}>
            {localPost.images.map((img, index) => (
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
          <span>{localPost.likes} lượt thích</span>
          <span>{localPost.comments} bình luận</span>
        </Box>

        <Divider />

        <Box className="fb-post-actions">
          <Button startIcon={<ThumbUpOffAltOutlinedIcon />}>Thích</Button>
          <Button startIcon={<ChatBubbleOutlineOutlinedIcon />}>Bình luận</Button>
          <Button startIcon={<ShareOutlinedIcon />}>Chia sẻ</Button>
        </Box>
      </Paper>

      <ReportPostModal open={openReport} post={localPost} onClose={() => setOpenReport(false)} onSubmit={(reasonId) => postService.reportPost(localPost.id, reasonId)} />
      <DeletePostConfirmDialog open={openDeleteConfirm} deleting={deletingPost} onClose={() => setOpenDeleteConfirm(false)} onConfirm={handleDelete} />
      <EditPostModal open={openEdit} post={localPost} saving={editingPost} onClose={() => setOpenEdit(false)} onSubmit={handleEdit} />
    </>
  );
}

export default PostCard;
