import { Box } from '@mui/material';
import type { ProfileTabKey, UserProfileResponse } from '../../types/user';

type Props = {
  profile: UserProfileResponse;
  friendCount?: number;
  onSelectTab?: (tab: ProfileTabKey) => void;
};

function ProfileStats({ profile, friendCount = 0, onSelectTab }: Props) {
  const postCount = profile.postCount ?? profile.posts?.length ?? 0;

  return (
    <Box className="profile-stats">
      <button type="button" className="profile-stat-item" onClick={() => onSelectTab?.('posts')}>
        <strong>{postCount}</strong>
        <span>bài viết</span>
      </button>

      <button type="button" className="profile-stat-item" onClick={() => onSelectTab?.('friends')}>
        <strong>{friendCount}</strong>
        <span>bạn bè</span>
      </button>

      <button type="button" className="profile-stat-item" onClick={() => onSelectTab?.('followers')}>
        <strong>{profile.followersCount}</strong>
        <span>người theo dõi</span>
      </button>

      <button type="button" className="profile-stat-item" onClick={() => onSelectTab?.('following')}>
        <strong>{profile.followingCount}</strong>
        <span>đang theo dõi</span>
      </button>
    </Box>
  );
}

export default ProfileStats;
