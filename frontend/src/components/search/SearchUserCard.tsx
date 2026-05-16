import { Avatar, Box, Button, Typography } from '@mui/material';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import { useNavigate } from 'react-router-dom';
import type { UserSearchResult } from '../../types/user';

type SearchUserCardProps = {
  user: UserSearchResult;
  actionLoading?: boolean;
  onAddFriend?: (user: UserSearchResult) => void;
  onAcceptFriend?: (user: UserSearchResult) => void;
  onMessage?: (user: UserSearchResult) => void;
};

function SearchUserCard({ user, actionLoading = false, onAddFriend, onAcceptFriend, onMessage }: SearchUserCardProps) {
  const navigate = useNavigate();

  const displayName = user.fullName || user.userName || 'Người dùng Ducky';
  const avatarText = displayName.charAt(0).toUpperCase();

  const friendshipStatus = user.friendshipStatus || (user.isFriend ? 'FRIEND' : 'NONE');

  const handleOpenProfile = () => {
    navigate(`/profile/${user.id}`);
  };

  const renderActionButton = () => {
    if (friendshipStatus === 'FRIEND') {
      return (
        <Button
          className="search-user-message-btn"
          startIcon={<ChatBubbleRoundedIcon />}
          onClick={() => onMessage?.(user)}
        >
          Nhắn tin
        </Button>
      );
    }

    if (friendshipStatus === 'PENDING_SENT') {
      return (
        <Button className="search-user-add-btn" startIcon={<HourglassEmptyRoundedIcon />} disabled>
          Đã gửi lời mời
        </Button>
      );
    }

    if (friendshipStatus === 'PENDING_RECEIVED') {
      return (
        <Button
          className="search-user-add-btn"
          startIcon={<CheckRoundedIcon />}
          disabled={actionLoading}
          onClick={() => onAcceptFriend?.(user)}
        >
          Chấp nhận
        </Button>
      );
    }

    return (
      <Button
        className="search-user-add-btn"
        startIcon={<PersonAddAlt1RoundedIcon />}
        disabled={actionLoading}
        onClick={() => onAddFriend?.(user)}
      >
        Thêm bạn bè
      </Button>
    );
  };

  return (
    <article className="search-user-card">
      <button type="button" className="search-user-main" onClick={handleOpenProfile}>
        <Box className={`search-user-avatar-wrap ${user.hasStory ? 'has-story' : ''}`}>
          <Avatar src={user.profileImage || undefined} className="search-user-avatar">
            {avatarText}
          </Avatar>
        </Box>

        <Box className="search-user-info">
          <Typography className="search-user-name">{displayName}</Typography>

          <Typography className="search-user-meta">
            {user.userName ? `@${user.userName}` : 'Người dùng Ducky'}
          </Typography>

          <Typography className="search-user-desc">
            {friendshipStatus === 'FRIEND'
              ? 'Bạn bè'
              : friendshipStatus === 'PENDING_SENT'
                ? 'Đang chờ phản hồi'
                : friendshipStatus === 'PENDING_RECEIVED'
                  ? 'Đã gửi lời mời cho bạn'
                  : 'Có thể bạn biết người này'}
          </Typography>
        </Box>
      </button>

      <Box className="search-user-actions">{renderActionButton()}</Box>
    </article>
  );
}

export default SearchUserCard;
