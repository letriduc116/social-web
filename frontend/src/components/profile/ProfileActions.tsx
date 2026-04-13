import { Box, Button } from '@mui/material';

type Props = {
  isOwner: boolean;
  isFollowing: boolean;
  onFollowToggle?: () => void;
  onEditProfile?: () => void;
};

function ProfileActions({ isOwner, isFollowing, onFollowToggle, onEditProfile }: Props) {
  if (isOwner) {
    return (
      <Box className="profile-actions">
        <Button variant="contained" className="profile-primary-btn" onClick={onEditProfile}>
          Chỉnh sửa hồ sơ
        </Button>
      </Box>
    );
  }

  return (
    <Box className="profile-actions">
      <Button
        variant={isFollowing ? 'outlined' : 'contained'}
        className={isFollowing ? 'profile-secondary-btn' : 'profile-primary-btn'}
        onClick={onFollowToggle}
      >
        {isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
      </Button>

      <Button variant="outlined" className="profile-secondary-btn">
        Nhắn tin
      </Button>
    </Box>
  );
}

export default ProfileActions;
