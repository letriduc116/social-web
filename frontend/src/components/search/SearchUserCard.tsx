import { Avatar, Box, Button, Typography } from '@mui/material';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import { useNavigate } from 'react-router-dom';
import type { UserSearchResult } from '../../types/user';

type SearchUserCardProps = {
  user: UserSearchResult;
  onAddFriend?: (user: UserSearchResult) => void;
  onMessage?: (user: UserSearchResult) => void;
};

function SearchUserCard({ user, onAddFriend, onMessage }: SearchUserCardProps) {
  const navigate = useNavigate();

  const displayName = user.fullName || user.userName || 'Người dùng Ducky';
  const avatarText = displayName.charAt(0).toUpperCase();
  const isFriend = Boolean(user.isFriend);

  const handleOpenProfile = () => {
    navigate(`/profile/${user.id}`);
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

          <Typography className="search-user-desc">{isFriend ? 'Bạn bè' : 'Có thể bạn biết người này'}</Typography>
        </Box>
      </button>

      <Box className="search-user-actions">
        {isFriend ? (
          <Button
            className="search-user-message-btn"
            startIcon={<ChatBubbleRoundedIcon />}
            onClick={() => onMessage?.(user)}
          >
            Nhắn tin
          </Button>
        ) : (
          <Button
            className="search-user-add-btn"
            startIcon={<PersonAddAlt1RoundedIcon />}
            onClick={() => onAddFriend?.(user)}
          >
            Thêm bạn bè
          </Button>
        )}
      </Box>
    </article>
  );
}

export default SearchUserCard;
