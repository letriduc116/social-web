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
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import type { PostItem, PostPrivacy, PostVisibility, UpdatePostPayload } from '../../types/post';

type EditPostModalProps = {
  open: boolean;
  post: PostItem | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit?: (payload: UpdatePostPayload) => Promise<void> | void;
};

const PRIVACY_OPTIONS: Record<PostPrivacy, { label: string; icon: ReactNode; visibility: PostVisibility }> = {
  public: { label: 'Mọi người', icon: <PublicOutlinedIcon fontSize="small" />, visibility: 'EVERYONE' },
  friends: { label: 'Bạn bè', icon: <PeopleAltOutlinedIcon fontSize="small" />, visibility: 'FRIENDS' },
  only_me: { label: 'Chỉ mình tôi', icon: <LockOutlinedIcon fontSize="small" />, visibility: 'ONLY_ME' },
};

function visibilityToPrivacy(visibility?: PostVisibility): PostPrivacy {
  if (visibility === 'FRIENDS') return 'friends';
  if (visibility === 'ONLY_ME') return 'only_me';
  return 'public';
}

function EditPostModal({ open, post, saving, onClose, onSubmit }: EditPostModalProps) {
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<PostPrivacy>('public');

  useEffect(() => {
    if (open && post) {
      setContent(post.content || '');
      setPrivacy(visibilityToPrivacy(post.visibility));
    }
  }, [open, post]);

  const dirty = useMemo(() => {
    if (!post) return false;
    return (
      content.trim() !== (post.content || '').trim() ||
      PRIVACY_OPTIONS[privacy].visibility !== (post.visibility || 'EVERYONE')
    );
  }, [content, post, privacy]);

  if (!post) return null;

  const userName = post.user?.fullName || post.user?.userName || 'Người dùng';

  const handlePrivacyChange = (event: SelectChangeEvent<PostPrivacy>) => {
    setPrivacy(event.target.value as PostPrivacy);
  };

  const handleSubmit = async () => {
    if (!dirty || saving) return;
    await onSubmit?.({
      content: content.trim(),
      visibility: PRIVACY_OPTIONS[privacy].visibility,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <Box sx={{ position: 'relative', px: 2.5, py: 1.7, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 22, fontWeight: 900 }}>Chỉnh sửa bài viết</Typography>
        <IconButton
          onClick={onClose}
          disabled={saving}
          sx={{ position: 'absolute', right: 12, top: 10, bgcolor: '#e4e6eb', '&:hover': { bgcolor: '#d8dadf' } }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <DialogContent sx={{ px: 2.5, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.3, mb: 1.5 }}>
          <Avatar src={post.user?.profileImage} sx={{ bgcolor: '#1976d2' }}>
            {userName.charAt(0)}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 900 }}>{userName}</Typography>
            <Select
              value={privacy}
              onChange={handlePrivacyChange}
              size="small"
              IconComponent={KeyboardArrowDownRoundedIcon}
              sx={{
                height: 30,
                bgcolor: '#e4e6eb',
                borderRadius: '8px',
                fontWeight: 800,
                '.MuiOutlinedInput-notchedOutline': { border: 0 },
                '.MuiSelect-select': { display: 'flex', alignItems: 'center', py: 0, pl: 1, pr: 3 },
              }}
              renderValue={(value) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  {PRIVACY_OPTIONS[value].icon}
                  <span>{PRIVACY_OPTIONS[value].label}</span>
                </Box>
              )}
            >
              <MenuItem value="public">
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <PublicOutlinedIcon fontSize="small" />
                  <Box>
                    <Typography fontWeight={800}>Mọi người</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ai cũng có thể xem
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem value="friends">
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <PeopleAltOutlinedIcon fontSize="small" />
                  <Box>
                    <Typography fontWeight={800}>Bạn bè</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chỉ bạn bè có thể xem
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem value="only_me">
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <LockOutlinedIcon fontSize="small" />
                  <Box>
                    <Typography fontWeight={800}>Chỉ mình tôi</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chỉ bạn có thể xem
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            </Select>
          </Box>
        </Box>

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Bạn đang nghĩ gì?"
          rows={6}
          style={{
            width: '100%',
            border: 0,
            outline: 'none',
            resize: 'vertical',
            fontSize: 22,
            fontFamily: 'inherit',
            lineHeight: 1.35,
            padding: '12px 0',
          }}
        />

        {post.images?.length ? (
          <Box className={`profile-post-image-grid ${post.images.length === 1 ? 'single' : ''}`} sx={{ mt: 1.5 }}>
            {post.images.map((img, index) => (
              <div key={img.id || index} className="profile-post-image-item">
                <img src={img.urlImage} alt={`post-${index}`} />
              </div>
            ))}
          </Box>
        ) : null}

        <Button
          fullWidth
          variant="contained"
          disabled={!dirty || saving}
          onClick={handleSubmit}
          sx={{ mt: 2.2, borderRadius: '10px', py: 1.1, fontWeight: 900 }}
        >
          {saving ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default EditPostModal;
