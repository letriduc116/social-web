import { Box, Button, Paper, Typography } from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import type { UserProfileResponse } from '../../types/user';

type Props = {
  profile: UserProfileResponse;
  isOwner?: boolean;
  onEditProfile?: () => void;
};

function ProfileAboutCard({ profile, isOwner = false, onEditProfile }: Props) {
  return (
    <Paper className="profile-card profile-about-card" elevation={0}>
      <Box className="profile-card-header">
        <Typography className="profile-card-title">Giới thiệu</Typography>
      </Box>

      <Box className="profile-about-list">
        <Box className="profile-about-line">
          <BadgeOutlinedIcon />
          <span>
            Họ tên: <strong>{profile.fullName || 'Chưa cập nhật'}</strong>
          </span>
        </Box>

        <Box className="profile-about-line">
          <AlternateEmailRoundedIcon />
          <span>
            Tên người dùng: <strong>@{profile.userName || 'Chưa cập nhật'}</strong>
          </span>
        </Box>

        <Box className="profile-about-line">
          <NotesRoundedIcon />
          <span>
            Tiểu sử: <strong>{profile.bio || 'Chưa có tiểu sử'}</strong>
          </span>
        </Box>
      </Box>

      {isOwner ? (
        <Button fullWidth className="profile-light-btn" startIcon={<EditRoundedIcon />} onClick={onEditProfile}>
          Chỉnh sửa chi tiết
        </Button>
      ) : null}
    </Paper>
  );
}

export default ProfileAboutCard;
