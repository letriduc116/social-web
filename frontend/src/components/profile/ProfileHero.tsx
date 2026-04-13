import { Avatar, Box, Typography } from '@mui/material';
import type { UserProfileResponse } from '../../types/user';

type Props = {
  profile: UserProfileResponse;
};

function ProfileHero({ profile }: Props) {
  return (
    <Box className="profile-hero">
      <Box className="profile-cover-placeholder" />

      <Box className="profile-hero-body">
        <Avatar src={profile.avatarUrl} className="profile-avatar">
          {profile.fullName?.charAt(0)}
        </Avatar>

        <Box className="profile-hero-info">
          <Typography className="profile-full-name">{profile.fullName}</Typography>

          <Typography className="profile-username">@{profile.userName}</Typography>

          {profile.bio ? <Typography className="profile-bio-text">{profile.bio}</Typography> : null}
        </Box>
      </Box>
    </Box>
  );
}

export default ProfileHero;
