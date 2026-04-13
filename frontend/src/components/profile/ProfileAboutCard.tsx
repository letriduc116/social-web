import { Paper, Typography } from '@mui/material';
import type { UserProfileResponse } from '../../types/user';

type Props = {
  profile: UserProfileResponse;
};

function ProfileAboutCard({ profile }: Props) {
  return (
    <Paper className="profile-card" elevation={1}>
      <Typography className="profile-card-title">Giới thiệu</Typography>

      <Typography className="profile-about-line">
        Họ tên: <strong>{profile.fullName || 'Chưa cập nhật'}</strong>
      </Typography>

      <Typography className="profile-about-line">
        Tên người dùng: <strong>@{profile.userName || 'Chưa cập nhật'}</strong>
      </Typography>

      <Typography className="profile-about-line">
        Tiểu sử: <strong>{profile.bio || 'Chưa có tiểu sử'}</strong>
      </Typography>
    </Paper>
  );
}

export default ProfileAboutCard;
