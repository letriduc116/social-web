import { useState, type MouseEvent } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import type { FriendshipStatus } from '../../types/friend';

type ProfileActionsProps = {
  isOwner: boolean;
  friendshipStatus: FriendshipStatus;
  isFollowing?: boolean;
  loading?: boolean;
  onFriendAction: () => void;
  onUnfollowFriend?: () => Promise<void> | void;
  onFollowFriendAgain?: () => Promise<void> | void;
  onUnfriend?: () => Promise<void> | void;
  onEditProfile: () => void;
  onMessage: () => void;
};

function ProfileActions({
  isOwner,
  friendshipStatus,
  isFollowing = false,
  loading = false,
  onFriendAction,
  onUnfollowFriend,
  onFollowFriendAgain,
  onUnfriend,
  onEditProfile,
  onMessage,
}: ProfileActionsProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [openUnfriendDialog, setOpenUnfriendDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const menuOpen = Boolean(menuAnchor);

  const closeMenu = () => setMenuAnchor(null);

  const openFriendMenu = (event: MouseEvent<HTMLElement>) => {
    if (loading || submitting) return;
    setMenuAnchor(event.currentTarget);
  };

  const handleToggleFollow = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      if (isFollowing) {
        await onUnfollowFriend?.();
      } else {
        await onFollowFriendAgain?.();
      }

      closeMenu();
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmUnfriend = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      await onUnfriend?.();
      setOpenUnfriendDialog(false);
      closeMenu();
    } finally {
      setSubmitting(false);
    }
  };

  if (isOwner) {
    return (
      <Box className="profile-actions">
        <Button className="profile-secondary-btn" startIcon={<EditRoundedIcon />} onClick={onEditProfile}>
          Chỉnh sửa trang cá nhân
        </Button>

        <Button className="profile-more-btn">
          <MoreHorizRoundedIcon />
        </Button>
      </Box>
    );
  }

  const renderFriendButton = () => {
    if (friendshipStatus === 'FRIEND') {
      return (
        <>
          <Button
            className="profile-secondary-btn"
            startIcon={<CheckRoundedIcon />}
            endIcon={<KeyboardArrowDownRoundedIcon />}
            onClick={openFriendMenu}
            disabled={loading || submitting}
          >
            Bạn bè
          </Button>

          <Menu
            anchorEl={menuAnchor}
            open={menuOpen}
            onClose={closeMenu}
            PaperProps={{ className: 'profile-actions-menu' }}
          >
            <MenuItem className="profile-actions-menu-item">
              <ListItemIcon>
                <StarRoundedIcon />
              </ListItemIcon>
              <ListItemText
                primary={<Typography className="profile-menu-title">Yêu thích</Typography>}
                secondary={<Typography className="profile-menu-desc">Ưu tiên nhìn thấy bài viết của người này.</Typography>}
              />
            </MenuItem>

            <MenuItem className="profile-actions-menu-item" onClick={handleToggleFollow} disabled={submitting}>
              <ListItemIcon>
                {isFollowing ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography className="profile-menu-title">
                    {isFollowing ? 'Bỏ theo dõi' : 'Theo dõi lại'}
                  </Typography>
                }
                secondary={
                  <Typography className="profile-menu-desc">
                    {isFollowing
                      ? 'Bạn vẫn là bạn bè nhưng sẽ ít thấy bài viết của người này.'
                      : 'Bạn sẽ nhìn thấy bài viết của người này trên bảng tin.'}
                  </Typography>
                }
              />
            </MenuItem>

            <Divider />

            <MenuItem
              className="profile-actions-menu-item profile-actions-danger-item"
              onClick={() => setOpenUnfriendDialog(true)}
              disabled={submitting}
            >
              <ListItemIcon>
                <PersonRemoveRoundedIcon />
              </ListItemIcon>
              <ListItemText
                primary={<Typography className="profile-menu-title">Hủy kết bạn</Typography>}
                secondary={<Typography className="profile-menu-desc">Hai bạn sẽ không còn trong danh sách bạn bè của nhau.</Typography>}
              />
            </MenuItem>
          </Menu>

          <Dialog
            open={openUnfriendDialog}
            onClose={() => !submitting && setOpenUnfriendDialog(false)}
            fullWidth
            maxWidth="xs"
            PaperProps={{ className: 'profile-confirm-dialog' }}
          >
            <DialogTitle className="profile-confirm-title">Hủy kết bạn?</DialogTitle>

            <DialogContent>
              <Typography className="profile-confirm-desc">
                Bạn có chắc muốn hủy kết bạn với người này không? Hai bạn sẽ không còn trong danh sách bạn bè của nhau.
              </Typography>
            </DialogContent>

            <DialogActions className="profile-confirm-actions">
              <Button
                className="profile-secondary-btn"
                onClick={() => setOpenUnfriendDialog(false)}
                disabled={submitting}
              >
                Hủy
              </Button>

              <Button className="profile-danger-btn" onClick={handleConfirmUnfriend} disabled={submitting}>
                {submitting ? 'Đang xử lý...' : 'Hủy kết bạn'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      );
    }

    if (friendshipStatus === 'PENDING_SENT') {
      return (
        <Button
          className="profile-secondary-btn"
          startIcon={<HourglassEmptyRoundedIcon />}
          onClick={onFriendAction}
          disabled={loading}
        >
          Đã gửi lời mời
        </Button>
      );
    }

    if (friendshipStatus === 'PENDING_RECEIVED') {
      return (
        <Button
          className="profile-primary-btn"
          startIcon={<CheckRoundedIcon />}
          onClick={onFriendAction}
          disabled={loading}
        >
          Chấp nhận
        </Button>
      );
    }

    return (
      <Button
        className="profile-primary-btn"
        startIcon={<PersonAddAlt1RoundedIcon />}
        onClick={onFriendAction}
        disabled={loading}
      >
        Thêm bạn bè
      </Button>
    );
  };

  return (
    <Box className="profile-actions">
      {renderFriendButton()}

      <Button className="profile-message-btn" startIcon={<ChatBubbleRoundedIcon />} onClick={onMessage}>
        Nhắn tin
      </Button>

      <Button className="profile-more-btn">
        <MoreHorizRoundedIcon />
      </Button>
    </Box>
  );
}

export default ProfileActions;
