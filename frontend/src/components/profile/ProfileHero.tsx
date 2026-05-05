import { useRef, type ChangeEvent, type ReactNode } from 'react';
import { Avatar, Box, Button, CircularProgress, Typography } from '@mui/material';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import type { UserProfileResponse } from '../../types/user';

type Props = {
  profile: UserProfileResponse;
  isOwner?: boolean;
  children?: ReactNode;
  onChangeAvatar?: (file: File) => void;
  onChangeCover?: (file: File) => void;
  avatarUploading?: boolean;
  coverUploading?: boolean;
};

const getAvatarText = (profile: UserProfileResponse) => {
  return (profile.fullName || profile.userName || 'U').trim().charAt(0).toUpperCase();
};

function ProfileHero({
  profile,
  isOwner = false,
  children,
  onChangeAvatar,
  onChangeCover,
  avatarUploading = false,
  coverUploading = false,
}: Props) {
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const displayName = profile.fullName || profile.userName || 'Người dùng';

  const handlePickAvatar = () => {
    if (!isOwner || avatarUploading) return;
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) {
      onChangeAvatar?.(file);
    }
  };

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) {
      onChangeCover?.(file);
    }
  };

  return (
    <Box className="profile-hero">
      <Box
        className={`profile-cover-placeholder ${profile.coverUrl ? 'has-cover-image' : ''}`}
        sx={
          profile.coverUrl
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.36) 100%), url(${profile.coverUrl})`,
              }
            : undefined
        }
      >
        {isOwner ? (
          <Button
            component="label"
            className="profile-cover-button"
            startIcon={coverUploading ? <CircularProgress size={16} /> : <CameraAltRoundedIcon />}
            disabled={coverUploading}
          >
            {coverUploading ? 'Đang tải...' : profile.coverUrl ? 'Đổi ảnh bìa' : 'Thêm ảnh bìa'}
            <input hidden type="file" accept="image/*" onChange={handleCoverChange} />
          </Button>
        ) : null}
      </Box>

      <Box className="profile-identity-row">
        <Box className="profile-avatar-wrap">
          <Avatar src={profile.avatarUrl} className="profile-avatar">
            {getAvatarText(profile)}
          </Avatar>

          {isOwner ? (
            <>
              <input
                ref={avatarInputRef}
                className="profile-hidden-file-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <button
                className="profile-avatar-edit-btn"
                type="button"
                aria-label="Đổi ảnh đại diện"
                onClick={handlePickAvatar}
                disabled={avatarUploading}
              >
                {avatarUploading ? <CircularProgress size={16} /> : <CameraAltRoundedIcon fontSize="small" />}
              </button>
            </>
          ) : null}
        </Box>

        <Box className="profile-identity-main">
          <Box className="profile-identity-text">
            <Typography className="profile-full-name">{displayName}</Typography>
            <Typography className="profile-username">@{profile.userName || 'username'}</Typography>
            {profile.bio ? <Typography className="profile-bio-text">{profile.bio}</Typography> : null}
          </Box>

          <Box className="profile-hero-actions-slot">{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ProfileHero;
