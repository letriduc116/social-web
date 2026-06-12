import { useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
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
import type { PostItem, PostVisibility, UpdatePostPayload } from '../../types/post';
import { commentService } from '../../services/commentService';
import { authStorage } from '../../services/authStorage';
import { postService } from '../../services/postService';
import PostOptionsMenu from './PostOptionsMenu';
import ReportPostModal from './ReportPostModal';
import DeletePostConfirmDialog from './DeletePostConfirmDialog';
import EditPostModal from './EditPostModal';

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

function getProfilePath(userId?: string) {
  return userId ? `/profile/${userId}` : '/profile';
}

function renderAuthorAvatar(post?: PostItem | null, onNavigate?: () => void, size = 40) {
  const userId = post?.user?.id;
  const avatar = (
    <Avatar
      src={post?.user?.profileImage}
      sx={{ bgcolor: '#1976d2', width: size, height: size, flexShrink: 0 }}
    >
      {getPostAuthorName(post).charAt(0)}
    </Avatar>
  );

  if (!userId) return avatar;

  return (
    <RouterLink
      to={getProfilePath(userId)}
      onClick={(event) => {
        event.stopPropagation();
        onNavigate?.();
      }}
      className="fb-author-avatar-link"
      aria-label={`Xem trang cá nhân của ${getPostAuthorName(post)}`}
    >
      {avatar}
    </RouterLink>
  );
}

function renderAuthorName(
  post?: PostItem | null,
  onNavigate?: () => void,
  className = 'fb-author-name-link',
) {
  const name = getPostAuthorName(post);
  const userId = post?.user?.id;

  if (!userId) {
    return (
      <Typography fontWeight={700} component="span">
        {name}
      </Typography>
    );
  }

  return (
    <RouterLink
      to={getProfilePath(userId)}
      onClick={(event) => {
        event.stopPropagation();
        onNavigate?.();
      }}
      className={className}
      aria-label={`Xem trang cá nhân của ${name}`}
    >
      {name}
    </RouterLink>
  );
}

function renderSharedPostPreview(sharedPost?: PostItem | null, onNavigate?: () => void) {
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
          {renderAuthorAvatar(sharedPost, onNavigate, 36)}

          <Box>
            <Typography fontWeight={700} component="div">
              {renderAuthorName(sharedPost, onNavigate)}
            </Typography>
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
  onShareClick,
  onPostDeleted,
}: PostDetailModalProps) {
  const [commentValue, setCommentValue] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [togglingLikePost, setTogglingLikePost] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [openReportPost, setOpenReportPost] = useState(false);
  const [openDeletePostConfirm, setOpenDeletePostConfirm] = useState(false);
  const [openEditPost, setOpenEditPost] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [editingPost, setEditingPost] = useState(false);

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
        setOpenReportPost(false);
        setOpenDeletePostConfirm(false);
        setOpenEditPost(false);
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

  const isShare = Boolean(post.shared || post.sharedPost);
  const isOwner = currentUserId === post.user?.id;

  const handleToggleSavePost = async () => {
    if (savingPost || isOwner) return;

    const previousPost = post;
    const optimisticPost: PostItem = { ...post, savedPost: !post.savedPost };
    onPostUpdated?.(optimisticPost);

    try {
      setSavingPost(true);
      if (post.savedPost) {
        await postService.unsavePost(post.id);
      } else {
        await postService.savePost(post.id);
      }
    } catch (error) {
      console.error(error);
      onPostUpdated?.(previousPost);
      alert(error instanceof Error ? error.message : 'Không thể lưu bài viết');
    } finally {
      setSavingPost(false);
    }
  };

  const handleReportPost = async (reasonId: string) => {
    await postService.reportPost(post.id, reasonId);
  };

  const handleHidePost = () => {
    onPostDeleted?.(post.id);
    onClose();
  };

  const handleDeletePost = async () => {
    if (deletingPost || !isOwner) return;

    try {
      setDeletingPost(true);
      await postService.deletePost(post.id);
      setOpenDeletePostConfirm(false);
      onPostDeleted?.(post.id);
      onClose();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Không thể xoá bài viết');
    } finally {
      setDeletingPost(false);
    }
  };

  const handleEditPost = async (payload: UpdatePostPayload) => {
    if (editingPost || !isOwner) return;

    const previousPost = post;
    const optimisticPost: PostItem = {
      ...post,
      content: payload.content ?? post.content,
      visibility: payload.visibility ?? post.visibility,
    };

    try {
      setEditingPost(true);
      onPostUpdated?.(optimisticPost);
      const updatedPost = await postService.updatePost(post.id, payload);
      onPostUpdated?.(updatedPost || optimisticPost);
      setOpenEditPost(false);
    } catch (error) {
      console.error(error);
      onPostUpdated?.(previousPost);
      alert(
        error instanceof Error
          ? `${error.message}. Nếu backend chưa có API chỉnh sửa bài viết, hãy thêm endpoint PUT /api/v1/post/update.`
          : 'Không thể chỉnh sửa bài viết',
      );
    } finally {
      setEditingPost(false);
    }
  };

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
                {renderAuthorAvatar(post, onClose)}

                <Box>
                  <Typography fontWeight={700} component="div">
                    {renderAuthorName(post, onClose)}
                  </Typography>
                  {isShare && post.sharedPost ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: -0.2 }}>
                      đã chia sẻ bài viết của{' '}
                      {renderAuthorName(post.sharedPost, onClose, 'fb-author-inline-link')}
                    </Typography>
                  ) : null}
                  <Box className="fb-post-meta">
                    <span>{formatTime(post.createAt)}</span>
                    {getVisibilityMeta(post.visibility).icon}
                  </Box>
                </Box>
              </Box>

              <PostOptionsMenu
                post={post}
                isOwner={isOwner}
                disabled={savingPost || deletingPost || editingPost}
                onEdit={() => setOpenEditPost(true)}
                onDelete={() => setOpenDeletePostConfirm(true)}
                onToggleSave={handleToggleSavePost}
                onReport={() => setOpenReportPost(true)}
                onHide={handleHidePost}
              />
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

            {post.sharedPost ? renderSharedPostPreview(post.sharedPost, onClose) : null}

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

              <Button startIcon={<ShareOutlinedIcon />} onClick={() => onShareClick?.(post)}>Chia sẻ</Button>
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

      <ReportPostModal
        open={openReportPost}
        post={post}
        onClose={() => setOpenReportPost(false)}
        onSubmit={handleReportPost}
      />

      <DeletePostConfirmDialog
        open={openDeletePostConfirm}
        deleting={deletingPost}
        onClose={() => setOpenDeletePostConfirm(false)}
        onConfirm={handleDeletePost}
      />

      <EditPostModal
        open={openEditPost}
        post={post}
        saving={editingPost}
        onClose={() => setOpenEditPost(false)}
        onSubmit={handleEditPost}
      />
    </>
  );
}

export default PostDetailModal;
