import { Box, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useState } from 'react';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import ReportGmailerrorredRoundedIcon from '@mui/icons-material/ReportGmailerrorredRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

type Props = {
  isOwner: boolean;
  isFollowing: boolean;
  loading?: boolean;
  onFollowToggle?: () => void;
  onEditProfile?: () => void;
  onMessage?: () => void;
};

function ProfileActions({ isOwner, isFollowing, loading = false, onFollowToggle, onEditProfile, onMessage }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(anchorEl);

  const handleCloseMenu = () => setAnchorEl(null);

  return (
    <Box className="profile-actions">
      {isOwner ? (
        <Button
          variant="contained"
          className="profile-primary-btn"
          startIcon={<EditRoundedIcon />}
          onClick={onEditProfile}
        >
          Chỉnh sửa trang cá nhân
        </Button>
      ) : (
        <>
          <Button
            variant={isFollowing ? 'outlined' : 'contained'}
            className={isFollowing ? 'profile-secondary-btn' : 'profile-primary-btn'}
            startIcon={isFollowing ? <PersonRemoveRoundedIcon /> : <PersonAddAlt1RoundedIcon />}
            disabled={loading}
            onClick={onFollowToggle}
          >
            {isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
          </Button>

          <Button variant="contained" className="profile-message-btn" startIcon={<ChatBubbleRoundedIcon />} onClick={onMessage}>
            Nhắn tin
          </Button>
        </>
      )}

      <IconButton className="profile-more-btn" onClick={(event) => setAnchorEl(event.currentTarget)}>
        <MoreHorizRoundedIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        PaperProps={{ className: 'profile-actions-menu' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {isOwner ? (
          <>
            <MenuItem onClick={handleCloseMenu} className="profile-actions-menu-item">
              <VisibilityRoundedIcon />
              <Box>
                <Typography className="profile-menu-title">Xem với tư cách khách</Typography>
                <Typography className="profile-menu-desc">Kiểm tra trang cá nhân như người khác nhìn thấy.</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleCloseMenu} className="profile-actions-menu-item">
              <ArchiveRoundedIcon />
              <Box>
                <Typography className="profile-menu-title">Kho lưu trữ</Typography>
                <Typography className="profile-menu-desc">Nơi lưu các bài viết đã ẩn hoặc đã xoá.</Typography>
              </Box>
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={handleCloseMenu} className="profile-actions-menu-item">
              <StarRoundedIcon />
              <Box>
                <Typography className="profile-menu-title">Thêm vào yêu thích</Typography>
                <Typography className="profile-menu-desc">Ưu tiên nhìn thấy bài viết của người này.</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleCloseMenu} className="profile-actions-menu-item">
              <ReportGmailerrorredRoundedIcon />
              <Box>
                <Typography className="profile-menu-title">Báo cáo trang cá nhân</Typography>
                <Typography className="profile-menu-desc">Báo cáo tài khoản giả mạo hoặc nội dung không phù hợp.</Typography>
              </Box>
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
}

export default ProfileActions;
