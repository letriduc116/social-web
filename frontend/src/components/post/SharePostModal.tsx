import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import type { SharePostModalProps } from '../../types/component';
import type { PostItem, PostPrivacy } from '../../types/post';

type PrivacyOption = PostPrivacy;

const PRIVACY_OPTIONS: Record<
  PrivacyOption,
  {
    label: string;
    description: string;
    icon: ReactNode;
  }
> = {
  public: {
    label: 'Mọi người',
    description: 'Ai cũng có thể xem bài chia sẻ này',
    icon: <PublicOutlinedIcon fontSize="small" />,
  },
  friends: {
    label: 'Bạn bè',
    description: 'Chỉ bạn bè của bạn có thể xem',
    icon: <PeopleAltOutlinedIcon fontSize="small" />,
  },
  only_me: {
    label: 'Chỉ mình tôi',
    description: 'Chỉ bạn có thể xem bài chia sẻ này',
    icon: <LockOutlinedIcon fontSize="small" />,
  },
};

function formatTime(value?: string) {
  if (!value) return 'Vừa xong';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
}

function getAuthorName(post?: PostItem | null) {
  return post?.user?.fullName || post?.user?.userName || 'Người dùng';
}

function SharePostModal({
  open,
  onClose,
  post,
  onSubmit,
  userName = 'Người dùng',
  userAvatarText = 'U',
}: SharePostModalProps) {
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<PrivacyOption>('public');
  const [submitting, setSubmitting] = useState(false);

  const sourcePost = useMemo(() => post?.sharedPost || post, [post]);
  const canShare = Boolean(sourcePost) && (sourcePost?.visibility || 'EVERYONE') === 'EVERYONE';

  useEffect(() => {
    if (!open) {
      setContent('');
      setPrivacy('public');
      setSubmitting(false);
    }
  }, [open]);

  const handlePrivacyChange = (event: SelectChangeEvent<PrivacyOption>) => {
    setPrivacy(event.target.value as PrivacyOption);
  };

  const handleSubmit = async () => {
    if (!sourcePost || !canShare || submitting) return;

    try {
      setSubmitting(true);
      await onSubmit?.({
        content: content.trim(),
        privacy,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm" PaperProps={{ className: 'fb-create-post-modal' }}>
      <Box className="fb-create-post-header">
        <Typography className="fb-create-post-title">Chia sẻ bài viết</Typography>

        <IconButton onClick={onClose} disabled={submitting} className="fb-create-post-close-btn">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <DialogContent className="fb-create-post-content">
        <Box className="fb-create-post-user">
          <Avatar className="fb-create-post-avatar">{userAvatarText}</Avatar>

          <Box className="fb-create-post-user-meta">
            <Typography className="fb-create-post-user-name">{userName}</Typography>

            <Select
              value={privacy}
              onChange={handlePrivacyChange}
              size="small"
              className="fb-create-post-privacy-select"
              IconComponent={KeyboardArrowDownRoundedIcon}
              renderValue={(value) => (
                <Box className="fb-create-post-privacy-value">
                  {PRIVACY_OPTIONS[value].icon}
                  <span>{PRIVACY_OPTIONS[value].label}</span>
                </Box>
              )}
              MenuProps={{
                anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                transformOrigin: { vertical: 'top', horizontal: 'left' },
                slotProps: {
                  paper: {
                    sx: {
                      mt: 0.5,
                      borderRadius: '12px',
                      minWidth: 286,
                      overflow: 'hidden',
                      boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
                    },
                  },
                },
              }}
            >
              {(Object.keys(PRIVACY_OPTIONS) as PrivacyOption[]).map((key) => (
                <MenuItem key={key} value={key}>
                  <Box className="fb-create-post-privacy-option">
                    {PRIVACY_OPTIONS[key].icon}
                    <Box>
                      <Typography fontWeight={600}>{PRIVACY_OPTIONS[key].label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {PRIVACY_OPTIONS[key].description}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>

        <textarea
          className="fb-create-post-textarea"
          placeholder="Hãy nói gì đó về bài viết này..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />

        {sourcePost ? (
          <Box
            className="fb-share-original-post"
            sx={{
              border: '1px solid #dadde1',
              borderRadius: '12px',
              overflow: 'hidden',
              bgcolor: '#fff',
              mb: 2,
            }}
          >
            {sourcePost.images?.length > 0 ? (
              <Box className={`profile-post-image-grid ${sourcePost.images.length === 1 ? 'single' : ''}`}>
                {sourcePost.images.map((img, index) => (
                  <div key={img.id || index} className="profile-post-image-item">
                    <img src={img.urlImage} alt={`share-original-${index}`} />
                  </div>
                ))}
              </Box>
            ) : null}

            <Box sx={{ p: 1.5 }}>
              <Box className="fb-post-author" sx={{ mb: 1 }}>
                <Avatar src={sourcePost.user?.profileImage} sx={{ bgcolor: '#1976d2', width: 36, height: 36 }}>
                  {getAuthorName(sourcePost).charAt(0)}
                </Avatar>

                <Box>
                  <Typography fontWeight={700}>{getAuthorName(sourcePost)}</Typography>
                  <Box className="fb-post-meta">
                    <span>{formatTime(sourcePost.createAt)}</span>
                    <PublicOutlinedIcon fontSize="inherit" />
                  </Box>
                </Box>
              </Box>

              {sourcePost.content ? <Typography className="fb-post-content">{sourcePost.content}</Typography> : null}
            </Box>
          </Box>
        ) : null}

        {!canShare ? (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            Chỉ có thể chia sẻ bài viết đang để chế độ Mọi người.
          </Typography>
        ) : null}

        <Button
          fullWidth
          variant="contained"
          className="fb-create-post-submit"
          disabled={!sourcePost || !canShare || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Đang chia sẻ...' : 'Chia sẻ ngay'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default SharePostModal;
