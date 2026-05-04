import { useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import ThumbUpOffAltOutlinedIcon from '@mui/icons-material/ThumbUpOffAltOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import GifBoxOutlinedIcon from '@mui/icons-material/GifBoxOutlined';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import type { CommentItem } from '../../types/comment';
import type { PostDetailModalProps } from '../../types/component';
import { commentService } from '../../services/commentService';
import { authStorage } from '../../services/authStorage';
import { postService } from '../../services/postService';

type ReplyTarget = {
  comment: CommentItem;
  parentCommentId: string;
  mentionName: string;
};

function formatTime(value?: string) {
  if (!value) return 'Vừa xong';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút`;
  if (hours < 24) return `${hours} giờ`;
  if (days < 7) return `${days} ngày`;

  return date.toLocaleDateString('vi-VN');
}

function getCommentDisplayName(comment?: CommentItem | null) {
  return comment?.sender?.fullName || comment?.sender?.userName || 'Người dùng';
}

function getCommentMentionName(comment?: CommentItem | null) {
  return comment?.sender?.fullName || comment?.sender?.userName || 'Người dùng';
}

function flattenReplies(replies: CommentItem[] = []): CommentItem[] {
  return replies.flatMap((reply) => [reply, ...flattenReplies(reply.replies || [])]);
}

function PostDetailModal({
  open,
  onClose,
  post,
  currentUserAvatarText = 'T',
  onPostUpdated,
  onCommentAdded,
}: PostDetailModalProps) {
  const [commentValue, setCommentValue] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [togglingLikePost, setTogglingLikePost] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const [replyingTo, setReplyingTo] = useState<ReplyTarget | null>(null);

  const [commentMenuAnchorEl, setCommentMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedCommentForMenu, setSelectedCommentForMenu] = useState<CommentItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<CommentItem | null>(null);

  const currentUserId = useMemo(() => {
    try {
      return authStorage.getCurrentUserId();
    } catch {
      return '';
    }
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      if (!open || !post?.id) {
        setComments([]);
        setReplyingTo(null);
        setCommentMenuAnchorEl(null);
        setSelectedCommentForMenu(null);
        setDeleteConfirmOpen(false);
        setCommentToDelete(null);
        return;
      }

      try {
        setLoadingComments(true);
        const response = await commentService.getCommentsByPost(post.id);
        setComments(response);
      } catch (error) {
        console.error(error);
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [open, post?.id]);

  if (!post) return null;

  const handleToggleLikePost = async () => {
    if (togglingLikePost) return;

    const optimisticPost = {
      ...post,
      liked: !post.liked,
      likes: post.liked ? Math.max(0, post.likes - 1) : post.likes + 1,
    };

    onPostUpdated?.(optimisticPost);

    try {
      setTogglingLikePost(true);

      if (post.liked) {
        await postService.unlikePost(post.id);
      } else {
        await postService.likePost(post.id);
      }
    } catch (error) {
      console.error(error);
      onPostUpdated?.(post);
      alert(error instanceof Error ? error.message : 'Không thể thích bài viết');
    } finally {
      setTogglingLikePost(false);
    }
  };

  const insertReplyIntoRootComment = (
    items: CommentItem[],
    parentCommentId: string,
    newReply: CommentItem,
  ): CommentItem[] =>
    items.map((item) => {
      if (item.id === parentCommentId) {
        return {
          ...item,
          replies: [...(item.replies || []), { ...newReply, replies: newReply.replies || [] }],
        };
      }

      return {
        ...item,
        replies: item.replies ? insertReplyIntoRootComment(item.replies, parentCommentId, newReply) : [],
      };
    });

  const handleAddComment = async () => {
    const rawContent = commentValue.trim();
    if (!rawContent || !currentUserId || submittingComment) return;

    const content = replyingTo ? `@${replyingTo.mentionName} ${rawContent}` : rawContent;

    try {
      setSubmittingComment(true);

      const createdComment = await commentService.addComment({
        content,
        postId: post.id,
        parentCommentId: replyingTo?.parentCommentId || null,
      });

      if (replyingTo?.parentCommentId) {
        setComments((prev) => insertReplyIntoRootComment(prev, replyingTo.parentCommentId, createdComment));
      } else {
        setComments((prev) => [...prev, createdComment]);
      }

      setCommentValue('');
      setReplyingTo(null);

      onPostUpdated?.({
        ...post,
        comments: post.comments + 1,
      });

      onCommentAdded?.();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Không thể thêm bình luận');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleToggleLikeComment = async (commentId: string) => {
    if (!currentUserId) return;

    const updateTree = (items: CommentItem[]): CommentItem[] =>
      items.map((item) => {
        if (item.id === commentId) {
          return {
            ...item,
            isLiked: !item.isLiked,
            likesCount: item.isLiked ? Math.max(0, item.likesCount - 1) : item.likesCount + 1,
          };
        }

        return {
          ...item,
          replies: item.replies ? updateTree(item.replies) : [],
        };
      });

    const previousComments = comments;
    setComments((prev) => updateTree(prev));

    try {
      const updatedComment = await commentService.toggleLikeComment(commentId);

      const replaceTree = (items: CommentItem[]): CommentItem[] =>
        items.map((item) => {
          if (item.id === updatedComment.id) {
            return {
              ...item,
              ...updatedComment,
              replies: item.replies,
            };
          }

          return {
            ...item,
            replies: item.replies ? replaceTree(item.replies) : [],
          };
        });

      setComments((prev) => replaceTree(prev));
    } catch (error) {
      console.error(error);
      setComments(previousComments);
      alert(error instanceof Error ? error.message : 'Không thể thích bình luận');
    }
  };

  const removeCommentFromTree = (items: CommentItem[], commentId: string): CommentItem[] =>
    items
      .filter((item) => item.id !== commentId)
      .map((item) => ({
        ...item,
        replies: item.replies ? removeCommentFromTree(item.replies, commentId) : [],
      }));

  const countAllComments = (comment: CommentItem): number =>
    1 + (comment.replies || []).reduce((total, reply) => total + countAllComments(reply), 0);

  const countDeletedComments = (items: CommentItem[], commentId: string): number => {
    for (const item of items) {
      if (item.id === commentId) {
        return countAllComments(item);
      }

      const replyCount = item.replies ? countDeletedComments(item.replies, commentId) : 0;
      if (replyCount > 0) return replyCount;
    }

    return 0;
  };

  const handleOpenCommentMenu = (event: MouseEvent<HTMLElement>, comment: CommentItem) => {
    event.stopPropagation();
    setCommentMenuAnchorEl(event.currentTarget);
    setSelectedCommentForMenu(comment);
  };

  const handleCloseCommentMenu = () => {
    setCommentMenuAnchorEl(null);
    setSelectedCommentForMenu(null);
  };

  const handleAskDeleteComment = () => {
    if (!selectedCommentForMenu) return;

    setCommentToDelete(selectedCommentForMenu);
    setCommentMenuAnchorEl(null);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    if (deletingCommentId) return;

    setDeleteConfirmOpen(false);
    setCommentToDelete(null);
  };

  const handleDeleteComment = async (comment: CommentItem) => {
    if (!currentUserId || deletingCommentId) return;

    const isMine = comment.sender?.id === currentUserId;
    if (!isMine) {
      alert('Bạn chỉ có thể xoá bình luận của chính mình');
      return;
    }

    const previousComments = comments;
    const deletedCount = countDeletedComments(comments, comment.id) || 1;

    try {
      setDeletingCommentId(comment.id);

      setComments((prev) => removeCommentFromTree(prev, comment.id));

      if (replyingTo?.comment.id === comment.id || replyingTo?.parentCommentId === comment.id) {
        setReplyingTo(null);
        setCommentValue('');
      }

      onPostUpdated?.({
        ...post,
        comments: Math.max(0, post.comments - deletedCount),
      });

      await commentService.deleteComment(comment.id);

      setDeleteConfirmOpen(false);
      setCommentToDelete(null);
      setSelectedCommentForMenu(null);
    } catch (error) {
      console.error(error);
      setComments(previousComments);
      onPostUpdated?.(post);
      alert(error instanceof Error ? error.message : 'Không thể xoá bình luận');
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleReplyClick = (comment: CommentItem, rootComment: CommentItem) => {
    const isMine = comment.sender?.id === currentUserId;
    if (isMine) return;

    setReplyingTo({
      comment,
      parentCommentId: rootComment.id,
      mentionName: getCommentMentionName(comment),
    });
  };

  const renderComment = (comment: CommentItem, isReply = false, rootComment?: CommentItem) => {
    const isMine = comment.sender?.id === currentUserId;
    const root = rootComment || comment;
    const repliesToShow = !isReply ? flattenReplies(comment.replies || []) : [];

    return (
      <Box key={comment.id} className={`fb-post-detail-comment-row ${isReply ? 'reply' : ''}`}>
        <Avatar src={comment.sender?.profileImage} className="fb-post-detail-comment-avatar">
          {(comment.sender?.fullName || comment.sender?.userName || 'U').charAt(0)}
        </Avatar>

        <Box className="fb-post-detail-comment-main">
          <Box className="fb-post-detail-comment-content-line">
            <Box className="fb-post-detail-comment-bubble-wrap">
              <Box className="fb-post-detail-comment-bubble">
                <Typography className="fb-post-detail-comment-author">{getCommentDisplayName(comment)}</Typography>
                <Typography className="fb-post-detail-comment-content">{comment.content}</Typography>
              </Box>

              {comment.likesCount > 0 ? (
                <Box className="fb-post-detail-comment-reaction-pill">
                  <ThumbUpAltOutlinedIcon className="fb-post-detail-comment-reaction-icon" />
                  <Typography component="span" className="fb-post-detail-comment-reaction-count">
                    {comment.likesCount}
                  </Typography>
                </Box>
              ) : null}
            </Box>

            {isMine ? (
              <IconButton
                size="small"
                className="fb-post-detail-comment-more-btn"
                onClick={(event) => handleOpenCommentMenu(event, comment)}
              >
                <MoreHorizOutlinedIcon fontSize="small" />
              </IconButton>
            ) : null}
          </Box>

          <Box className="fb-post-detail-comment-meta">
            <span className="fb-post-detail-comment-time">{formatTime(comment.createdAt)}</span>

            <button
              type="button"
              className={`fb-comment-action-btn ${comment.isLiked ? 'active' : ''}`}
              onClick={() => handleToggleLikeComment(comment.id)}
            >
              {comment.isLiked ? 'Đã thích' : 'Thích'}
            </button>

            {!isMine ? (
              <button type="button" className="fb-comment-action-btn" onClick={() => handleReplyClick(comment, root)}>
                Trả lời
              </button>
            ) : null}
          </Box>

          {repliesToShow.length > 0 ? (
            <Box className="fb-post-detail-replies">
              {repliesToShow.map((reply) => renderComment(reply, true, comment))}
            </Box>
          ) : null}
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ className: 'fb-post-detail-modal' }}>
        <Box className="fb-post-detail-header">
          <Typography className="fb-post-detail-title">
            Bài viết của {post.user?.fullName || post.user?.userName || 'Người dùng'}
          </Typography>

          <IconButton onClick={onClose} className="fb-post-detail-close-btn">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <DialogContent className="fb-post-detail-content">
          <Box className="fb-post-detail-scroll">
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

              <IconButton>
                <MoreHorizOutlinedIcon />
              </IconButton>
            </Box>

            <Typography className="fb-post-content fb-post-detail-main-content">{post.content}</Typography>

            {post.images?.length > 0 && (
              <Box className={`profile-post-image-grid ${post.images.length === 1 ? 'single' : ''}`}>
                {post.images.map((img, index) => (
                  <div key={img.id || index} className="profile-post-image-item">
                    <img src={img.urlImage} alt={`post-${index}`} />
                  </div>
                ))}
              </Box>
            )}

            <Box className="fb-post-detail-stats-row">
              <Box className="fb-post-detail-stats-left">
                <span>{post.likes} lượt thích</span>
              </Box>
              <Box className="fb-post-detail-stats-right">
                <span>{post.comments} bình luận</span>
              </Box>
            </Box>

            <Divider />

            <Box className="fb-post-actions fb-post-detail-actions">
              <Button
                className={post.liked ? 'fb-post-action-liked' : ''}
                startIcon={post.liked ? <ThumbUpAltOutlinedIcon /> : <ThumbUpOffAltOutlinedIcon />}
                onClick={handleToggleLikePost}
                disabled={togglingLikePost}
              >
                {post.liked ? 'Đã thích' : 'Thích'}
              </Button>

              <Button startIcon={<ChatBubbleOutlineOutlinedIcon />}>Bình luận</Button>

              <Button startIcon={<ShareOutlinedIcon />}>Chia sẻ</Button>
            </Box>

            <Divider />

            <Box className="fb-post-detail-comments-head">
              <Typography fontWeight={700}>Phù hợp nhất</Typography>
            </Box>

            <Box className="fb-post-detail-comments-list">
              {loadingComments ? (
                <Typography color="text.secondary">Đang tải bình luận...</Typography>
              ) : comments.length > 0 ? (
                comments.map((comment) => renderComment(comment))
              ) : (
                <Typography color="text.secondary">Chưa có bình luận nào</Typography>
              )}
            </Box>
          </Box>

          <Divider />

          <Box className="fb-post-detail-comment-box">
            <Avatar className="fb-post-detail-comment-input-avatar">{currentUserAvatarText}</Avatar>

            <Box className="fb-post-detail-comment-input-wrap">
              {replyingTo ? (
                <Box className="fb-post-detail-replying-banner">
                  <Typography variant="body2" color="text.secondary">
                    Đang trả lời <strong>@{replyingTo.mentionName}</strong>
                  </Typography>

                  <Button size="small" className="fb-post-detail-replying-cancel" onClick={() => setReplyingTo(null)}>
                    Huỷ
                  </Button>
                </Box>
              ) : null}

              <TextField
                fullWidth
                placeholder={replyingTo ? `Trả lời ${replyingTo.mentionName}...` : 'Viết bình luận...'}
                value={commentValue}
                onChange={(e) => setCommentValue(e.target.value)}
                size="small"
                className="fb-post-detail-comment-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />

              <Box className="fb-post-detail-comment-tools">
                <IconButton size="small">
                  <SentimentSatisfiedAltOutlinedIcon />
                </IconButton>
                <IconButton size="small">
                  <ImageOutlinedIcon />
                </IconButton>
                <IconButton size="small">
                  <GifBoxOutlinedIcon />
                </IconButton>
                <IconButton size="small">
                  <AddPhotoAlternateOutlinedIcon />
                </IconButton>
              </Box>
            </Box>

            <Button
              variant="contained"
              onClick={handleAddComment}
              disabled={!commentValue.trim() || submittingComment}
              className="fb-post-detail-send-btn"
            >
              Gửi
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Menu
        anchorEl={commentMenuAnchorEl}
        open={Boolean(commentMenuAnchorEl)}
        onClose={handleCloseCommentMenu}
        className="fb-comment-options-menu"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            className: 'fb-comment-options-paper',
          },
        }}
      >
        <MenuItem className="fb-comment-options-item danger" onClick={handleAskDeleteComment}>
          <ListItemIcon>
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <Typography>Xoá bình luận</Typography>
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        fullWidth
        maxWidth="xs"
        PaperProps={{ className: 'fb-delete-comment-dialog' }}
      >
        <Box className="fb-delete-comment-header">
          <Typography className="fb-delete-comment-title">Xoá bình luận?</Typography>
        </Box>

        <DialogContent className="fb-delete-comment-content">
          <Typography>Bình luận này sẽ bị xoá khỏi bài viết. Bạn có chắc chắn muốn xoá không?</Typography>
        </DialogContent>

        <DialogActions className="fb-delete-comment-actions">
          <Button
            onClick={handleCloseDeleteConfirm}
            disabled={Boolean(deletingCommentId)}
            className="fb-delete-comment-cancel-btn"
          >
            Huỷ
          </Button>

          <Button
            variant="contained"
            color="error"
            disabled={!commentToDelete || deletingCommentId === commentToDelete?.id}
            onClick={() => {
              if (commentToDelete) {
                handleDeleteComment(commentToDelete);
              }
            }}
            className="fb-delete-comment-submit-btn"
          >
            {deletingCommentId === commentToDelete?.id ? 'Đang xoá...' : 'Xoá'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PostDetailModal;
