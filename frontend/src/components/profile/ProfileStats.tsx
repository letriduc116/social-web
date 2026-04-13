import { Box } from '@mui/material';
import type { UserProfileResponse } from '../../types/user';

type Props = {
  profile: UserProfileResponse;
};

function ProfileStats({ profile }: Props) {
  return (
    <Box className="profile-stats">
      <div>
        <strong>{profile.postCount ?? profile.posts.length}</strong> bài viết
      </div>
      <div>
        <strong>{profile.followersCount}</strong> người theo dõi
      </div>
      <div>
        <strong>{profile.followingCount}</strong> đang theo dõi
      </div>
    </Box>
  );
}

export default ProfileStats;
