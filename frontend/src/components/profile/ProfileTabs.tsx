import { Box, Button } from '@mui/material';
import type { ProfileTabKey } from '../../types/user';

type Props = {
  activeTab: ProfileTabKey;
  onChange: (tab: ProfileTabKey) => void;
};

const tabs: { key: ProfileTabKey; label: string }[] = [
  { key: 'posts', label: 'Bài viết' },
  { key: 'followers', label: 'Người theo dõi' },
  { key: 'following', label: 'Đang theo dõi' },
];

function ProfileTabs({ activeTab, onChange }: Props) {
  return (
    <Box className="profile-tabs">
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
  );
}

export default ProfileTabs;
