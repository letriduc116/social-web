import { Avatar, Box, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import type { UserSummary } from '../../types/user';

type Props = {
  title: string;
  users: UserSummary[];
};

function ProfileUserListCard({ title, users }: Props) {
  return (
    <Paper className="profile-card" elevation={1}>
      <Typography className="profile-card-title">{title}</Typography>

      <Box className="profile-user-list">
        {users.length === 0 ? (
          <Typography className="profile-empty-text">Chưa có dữ liệu</Typography>
        ) : (
          users.map((user) => (
            <Link to={`/profile/${user.id}`} key={user.id} className="profile-user-item">
              <Avatar src={user.profileImage}>{user.fullName?.charAt(0)}</Avatar>

              <Box>
                <Typography className="profile-user-name">{user.fullName}</Typography>
                <Typography className="profile-user-username">@{user.userName || 'unknown'}</Typography>
              </Box>
            </Link>
          ))
        )}
      </Box>
    </Paper>
  );
}

export default ProfileUserListCard;
