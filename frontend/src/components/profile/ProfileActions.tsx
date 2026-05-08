import { Box, Button } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

type ProfileActionsProps = {
  isOwner: boolean;
  isFollowing?: boolean;
  friendRequestSent?: boolean;
  loading?: boolean;
  onFollowToggle: () => void;
  onEditProfile: () => void;
  onMessage: () => void;
};

function ProfileActions({
  isOwner,
  friendRequestSent = false,
  loading = false,
  onFollowToggle,
  onEditProfile,
  onMessage,
}: ProfileActionsProps) {
  if (isOwner) {
    return (
      <Box className="profile-actions">
        <Button className="profile-secondary-btn" startIcon={<EditRoundedIcon />} onClick={onEditProfile}>
          Chỉnh sửa trang cá nhân
        </Button>

        <Button className="profile-more-btn">
          <MoreHorizRoundedIcon />
        </Button>
      </Box>
    );
  }

  return (
    <Box className="profile-actions">
      <Button
        className={friendRequestSent ? 'profile-secondary-btn' : 'profile-primary-btn'}
        startIcon={friendRequestSent ? <CheckRoundedIcon /> : <PersonAddAlt1RoundedIcon />}
        onClick={onFollowToggle}
        disabled={loading}
      >
        {friendRequestSent ? 'Đã gửi lời mời' : 'Thêm bạn bè'}
      </Button>

      <Button className="profile-message-btn" startIcon={<ChatBubbleRoundedIcon />} onClick={onMessage}>
        Nhắn tin
      </Button>

      <Button className="profile-more-btn">
        <MoreHorizRoundedIcon />
      </Button>
    </Box>
  );
}

export default ProfileActions;
