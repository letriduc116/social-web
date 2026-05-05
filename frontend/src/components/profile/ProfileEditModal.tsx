import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import type { UserProfileResponse } from '../../types/user';

type EditProfilePayload = {
  fullName: string;
  userName: string;
  bio: string;
};

type Props = {
  open: boolean;
  profile: UserProfileResponse;
  onClose: () => void;
  onSubmit: (payload: EditProfilePayload) => Promise<void> | void;
};

function ProfileEditModal({ open, profile, onClose, onSubmit }: Props) {
  const [fullName, setFullName] = useState('');
  const [userName, setUserName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFullName(profile.fullName || '');
      setUserName(profile.userName || '');
      setBio(profile.bio || '');
      setSaving(false);
    }
  }, [open, profile.fullName, profile.userName, profile.bio]);

  const canSave = fullName.trim().length > 0 && userName.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSave || saving) return;

    try {
      setSaving(true);
      await onSubmit({
        fullName: fullName.trim(),
        userName: userName.trim(),
        bio: bio.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const avatarText = (fullName || userName || 'U').charAt(0).toUpperCase();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ className: 'profile-edit-dialog' }}>
      <Box className="profile-edit-header">
        <Typography className="profile-edit-title">Chỉnh sửa trang cá nhân</Typography>
        <IconButton className="profile-edit-close" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      <Divider />

      <DialogContent className="profile-edit-content">
        <Box className="profile-edit-preview">
          <Avatar src={profile.avatarUrl} className="profile-edit-avatar">
            {avatarText}
          </Avatar>
          <Box>
            <Typography className="profile-edit-preview-name">{fullName || 'Tên hiển thị'}</Typography>
            <Typography className="profile-edit-preview-user">@{userName || 'username'}</Typography>
          </Box>
        </Box>

        <TextField
          label="Họ tên"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          fullWidth
          size="small"
        />

        <TextField
          label="Tên người dùng"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
          fullWidth
          size="small"
        />

        <TextField
          label="Tiểu sử"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          fullWidth
          multiline
          minRows={3}
          inputProps={{ maxLength: 160 }}
          helperText={`${bio.length}/160`}
        />

        <Button fullWidth variant="contained" className="profile-edit-save" disabled={!canSave || saving} onClick={handleSubmit}>
          {saving ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileEditModal;
