import { Avatar, Box, Button, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import type { UserSummary } from '../../types/user';

type Props = {
  title: string;
  users: UserSummary[];
  compact?: boolean;
  maxItems?: number;
  onViewAll?: () => void;
};

function ProfileUserListCard({ title, users, compact = false, maxItems, onViewAll }: Props) {
  const visibleUsers = typeof maxItems === 'number' ? users.slice(0, maxItems) : users;

  return (
    <Paper className="profile-card profile-user-list-card" elevation={0}>
      <Box className="profile-card-header">
        <Box>
          <Typography className="profile-card-title">{title}</Typography>
          <Typography className="profile-card-subtitle">{users.length} người</Typography>
        </Box>

        {onViewAll && users.length > visibleUsers.length ? (
          <Button className="profile-text-btn" onClick={onViewAll}>
            Xem tất cả
          </Button>
        ) : null}
      </Box>

      <Box className={compact ? 'profile-user-grid' : 'profile-user-list'}>
        {visibleUsers.length === 0 ? (
          <Typography className="profile-empty-text">Chưa có dữ liệu</Typography>
        ) : (
          visibleUsers.map((user) => {
            const name = user.fullName || user.userName || 'Người dùng';
            return (
              <Link to={`/profile/${user.id}`} key={user.id} className={compact ? 'profile-user-tile' : 'profile-user-item'}>
                <Avatar src={user.profileImage} className="profile-user-avatar">
                  {name.charAt(0).toUpperCase()}
                </Avatar>

                <Box className="profile-user-info">
                  <Typography className="profile-user-name">{name}</Typography>
                  <Typography className="profile-user-username">@{user.userName || 'unknown'}</Typography>
                </Box>
              </Link>
            );
          })
        )}
      </Box>
    </Paper>
  );
}

export default ProfileUserListCard;
