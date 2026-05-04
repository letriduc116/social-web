import { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Button, Dialog, DialogContent, Divider, IconButton, TextField, Typography } from '@mui/material';
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

import type { CommentItem } from '../../types/comment';
import type { PostDetailModalProps } from '../../types/component';
import { commentService } from '../../services/commentService';
import { authStorage } from '../../services/authStorage';
import { postService } from '../../services/postService';

function formatTime(value?: string) {
  if (!value) return 'Vừa xong';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
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

  const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);

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

  const insertReplyIntoTree = (items: CommentItem[], parentCommentId: string, newReply: CommentItem): CommentItem[] =>
    items.map((item) => {
      if (item.id === parentCommentId) {
        return {
          ...item,
          replies: [...(item.replies || []), newReply],
        };
      }

      return {
        ...item,
        replies: item.replies ? insertReplyIntoTree(item.replies, parentCommentId, newReply) : [],
      };
    });

  const handleAddComment = async () => {
    const content = commentValue.trim();
    if (!content || !currentUserId || submittingComment) return;

    try {
      setSubmittingComment(true);

      const createdComment = await commentService.addComment({
        content,
        postId: post.id,
        parentCommentId: replyingTo?.id || null,
      });

      if (replyingTo?.id) {
        setComments((prev) => insertReplyIntoTree(prev, replyingTo.id, createdComment));
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

  const handleReplyClick = (comment: CommentItem) => {
    setReplyingTo(comment);
  };

  const renderComment = (comment: CommentItem, isReply = false) => (
    <Box key={comment.id} className={`fb-post-detail-comment-row ${isReply ? 'reply' : ''}`}>
      <Avatar className="fb-post-detail-comment-avatar">
        {(comment.sender?.fullName || comment.sender?.userName || 'U').charAt(0)}
      </Avatar>

      <Box className="fb-post-detail-comment-main">
        <Box className="fb-post-detail-comment-bubble">
          <Typography className="fb-post-detail-comment-author">
            {comment.sender?.fullName || comment.sender?.userName || 'Người dùng'}
          </Typography>
          <Typography className="fb-post-detail-comment-content">{comment.content}</Typography>
        </Box>

        <Box className="fb-post-detail-comment-meta">
          <button type="button" onClick={() => handleToggleLikeComment(comment.id)}>
            {comment.isLiked ? 'Đã thích' : 'Thích'}
          </button>

          <button type="button" onClick={() => handleReplyClick(comment)}>
            Trả lời
          </button>

          <span>{formatTime(comment.createdAt)}</span>
          {comment.likesCount > 0 ? <span>{comment.likesCount}</span> : null}
        </Box>

        {comment.replies?.length ? (
          <Box className="fb-post-detail-replies">{comment.replies.map((reply) => renderComment(reply, true))}</Box>
        ) : null}
      </Box>
    </Box>
  );

  return (
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
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                  px: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Đang trả lời: <strong>{replyingTo.sender?.fullName || replyingTo.sender?.userName}</strong>
                </Typography>

                <Button size="small" onClick={() => setReplyingTo(null)}>
                  Huỷ
                </Button>
              </Box>
            ) : null}

            <TextField
              fullWidth
              placeholder={replyingTo ? 'Viết phản hồi...' : 'Viết bình luận...'}
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
  );
}

export default PostDetailModal;
