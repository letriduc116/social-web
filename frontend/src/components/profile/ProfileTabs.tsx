import { Box, Button } from '@mui/material';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import type { ProfileTabKey } from '../../types/user';

type Props = {
  activeTab: ProfileTabKey;
  onChange: (tab: ProfileTabKey) => void;
};

const tabs: { key: ProfileTabKey; label: string }[] = [
  { key: 'posts', label: 'Bài viết' },
  { key: 'about', label: 'Giới thiệu' },
  { key: 'friends', label: 'Bạn bè' },
  { key: 'followers', label: 'Người theo dõi' },
  { key: 'following', label: 'Đang theo dõi' },
];

function ProfileTabs({ activeTab, onChange }: Props) {
  return (
    <Box className="profile-tabs">
      <Box className="profile-tab-list">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`profile-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
          >
            {tab.label}
          </Button>
        ))}
      </Box>

      <Button className="profile-tab-more-btn" startIcon={<MoreHorizRoundedIcon />}>
        Xem thêm
      </Button>
    </Box>
  );
}

export default ProfileTabs;
