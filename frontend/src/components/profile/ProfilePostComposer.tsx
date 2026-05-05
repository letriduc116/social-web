import { Avatar, Box, Button, Divider, Paper } from '@mui/material';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import type { UserProfileResponse } from '../../types/user';

type Props = {
  profile: UserProfileResponse;
  isOwner: boolean;
  onOpenCreatePost?: () => void;
};

function ProfilePostComposer({ profile, isOwner, onOpenCreatePost }: Props) {
  if (!isOwner) return null;

  const name = profile.fullName || profile.userName || 'bạn';
  const avatarText = name.charAt(0).toUpperCase();

  return (
    <Paper className="profile-composer-card" elevation={0}>
      <Box className="profile-composer-main">
        <Avatar src={profile.avatarUrl} className="profile-composer-avatar">
          {avatarText}
        </Avatar>

        <button type="button" className="profile-composer-input" onClick={onOpenCreatePost}>
          {name} ơi, bạn đang nghĩ gì?
        </button>
      </Box>

      <Divider />

      <Box className="profile-composer-actions">
        <Button startIcon={<VideocamRoundedIcon sx={{ color: '#f3425f' }} />}>Video trực tiếp</Button>
        <Button startIcon={<ImageRoundedIcon sx={{ color: '#45bd62' }} />} onClick={onOpenCreatePost}>
          Ảnh/video
        </Button>
        <Button startIcon={<SentimentSatisfiedAltRoundedIcon sx={{ color: '#f7b928' }} />}>Cảm xúc</Button>
      </Box>
    </Paper>
  );
}

export default ProfilePostComposer;
