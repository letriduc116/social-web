import { Avatar, Box, Typography } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import type { UserSearchResult } from '../../../types/user';

type UserSearchResultItemProps = {
  user: UserSearchResult;
  onClick: (user: UserSearchResult) => void;
};

function UserSearchResultItem({ user, onClick }: UserSearchResultItemProps) {
  const displayName = user.fullName || user.userName || 'Người dùng Ducky';
  const subText = user.isFollowing ? 'Đang theo dõi' : user.userName ? `@${user.userName}` : 'Người dùng';

  const avatarText = displayName.charAt(0).toUpperCase();

  return (
    <button type="button" className="fb-user-search-item" onClick={() => onClick(user)}>
      <Box className={`fb-user-search-avatar-wrap ${user.hasStory ? 'has-story' : ''}`}>
        <Avatar src={user.profileImage || undefined} className="fb-user-search-avatar">
          {avatarText}
        </Avatar>
      </Box>

      <Box className="fb-user-search-info">
        <Typography className="fb-user-search-name">{displayName}</Typography>
        <Typography className="fb-user-search-subtext">{subText}</Typography>
      </Box>

      <Box className="fb-user-search-icon">
        <SearchOutlinedIcon fontSize="small" />
      </Box>
    </button>
  );
}

export default UserSearchResultItem;
