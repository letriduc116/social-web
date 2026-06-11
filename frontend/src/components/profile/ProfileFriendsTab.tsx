import { useMemo, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import type { FriendSummary } from '../../types/friend';

type Props = {
  friends: FriendSummary[];
  isOwner?: boolean;
  actionLoadingIds?: string[];
  onUnfollowFriend?: (friend: FriendSummary) => Promise<void> | void;
  onFollowFriendAgain?: (friend: FriendSummary) => Promise<void> | void;
  onUnfriend?: (friend: FriendSummary) => Promise<void> | void;
};

function getFriendName(friend: FriendSummary) {
  return friend.fullName || friend.userName || 'Người dùng Ducky';
}

function ProfileFriendsTab({
  friends,
  isOwner = false,
  actionLoadingIds = [],
  onUnfollowFriend,
  onFollowFriendAgain,
  onUnfriend,
}: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'following'>('all');

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<FriendSummary | null>(null);
  const [openUnfriendDialog, setOpenUnfriendDialog] = useState(false);

  const menuOpen = Boolean(menuAnchor);
  const selectedFriendName = selectedFriend ? getFriendName(selectedFriend) : '';
  const selectedFriendFollowing = selectedFriend?.following ?? true;
  const selectedFriendLoading = selectedFriend ? actionLoadingIds.includes(selectedFriend.id) : false;

  const filteredFriends = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return friends.filter((friend) => {
      const name = getFriendName(friend).toLowerCase();
      const userName = (friend.userName || '').toLowerCase();

      const matchKeyword = !keyword || name.includes(keyword) || userName.includes(keyword);
      const matchFilter = filter === 'all' || friend.following;

      return matchKeyword && matchFilter;
    });
  }, [friends, query, filter]);

  const openMenu = (event: MouseEvent<HTMLElement>, friend: FriendSummary) => {
    event.preventDefault();
    event.stopPropagation();

    setSelectedFriend(friend);
    setMenuAnchor(event.currentTarget);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const handleToggleFollow = async () => {
    if (!selectedFriend || selectedFriendLoading) return;

    if (selectedFriendFollowing) {
      await onUnfollowFriend?.(selectedFriend);
    } else {
      await onFollowFriendAgain?.(selectedFriend);
    }

    closeMenu();
  };

  const handleConfirmUnfriend = async () => {
    if (!selectedFriend || selectedFriendLoading) return;

    await onUnfriend?.(selectedFriend);
    setOpenUnfriendDialog(false);
    closeMenu();
  };

  return (
    <Paper className="profile-card profile-friends-tab-card" elevation={0}>
      <Box className="profile-friends-head">
        <Box>
          <Typography className="profile-card-title">Bạn bè</Typography>
          <Typography className="profile-card-subtitle">{friends.length} người bạn</Typography>
        </Box>

        <TextField
          size="small"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm kiếm"
          className="profile-friends-search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box className="profile-friends-filter-row">
        <button
          type="button"
          className={`profile-friends-filter ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả bạn bè
        </button>

        <button
          type="button"
          className={`profile-friends-filter ${filter === 'following' ? 'active' : ''}`}
          onClick={() => setFilter('following')}
        >
          Đang theo dõi
        </button>
      </Box>

      <Divider />

      {filteredFriends.length === 0 ? (
        <Box className="profile-friends-empty">
          <PeopleAltRoundedIcon />
          <Typography className="profile-empty-title">Chưa có bạn bè để hiển thị</Typography>
          <Typography className="profile-empty-desc">Khi có bạn bè, danh sách bạn bè sẽ xuất hiện ở đây.</Typography>
        </Box>
      ) : (
        <Box className="profile-friends-grid">
          {filteredFriends.map((friend) => {
            const name = getFriendName(friend);
            const avatarText = name.charAt(0).toUpperCase();
            const loading = actionLoadingIds.includes(friend.id);

            return (
              <Box className="profile-friend-card" key={friend.id}>
                <Link to={`/profile/${friend.id}`} className="profile-friend-main">
                  <Avatar src={friend.profileImage || friend.avatarUrl} className="profile-friend-avatar">
                    {avatarText}
                  </Avatar>

                  <Box className="profile-friend-info">
                    <Typography className="profile-friend-name">{name}</Typography>

                    <Typography className="profile-friend-meta">
                      {typeof friend.mutualFriendsCount === 'number'
                        ? `${friend.mutualFriendsCount} bạn chung`
                        : friend.following === false
                          ? 'Đã bỏ theo dõi'
                          : 'Bạn bè'}
                    </Typography>
                  </Box>
                </Link>

                {isOwner ? (
                  <IconButton
                    className="profile-friend-more-btn"
                    onClick={(event) => openMenu(event, friend)}
                    disabled={loading}
                    aria-label={`Tùy chọn với ${name}`}
                  >
                    <MoreHorizRoundedIcon />
                  </IconButton>
                ) : null}
              </Box>
            );
          })}
        </Box>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={closeMenu}
        PaperProps={{ className: 'profile-actions-menu profile-friend-options-menu' }}
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

        <MenuItem className="profile-actions-menu-item" onClick={handleToggleFollow} disabled={selectedFriendLoading}>
          <ListItemIcon>
            {selectedFriendFollowing ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography className="profile-menu-title">
                {selectedFriendFollowing ? 'Bỏ theo dõi' : 'Theo dõi lại'}
              </Typography>
            }
            secondary={
              <Typography className="profile-menu-desc">
                {selectedFriendFollowing
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
          disabled={selectedFriendLoading}
        >
          <ListItemIcon>
            <PersonRemoveRoundedIcon />
          </ListItemIcon>
          <ListItemText
            primary={<Typography className="profile-menu-title">Hủy kết bạn</Typography>}
            secondary={
              <Typography className="profile-menu-desc">Hai bạn sẽ không còn trong danh sách bạn bè.</Typography>
            }
          />
        </MenuItem>
      </Menu>

      <Dialog
        open={openUnfriendDialog}
        onClose={() => !selectedFriendLoading && setOpenUnfriendDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ className: 'profile-confirm-dialog' }}
      >
        <DialogTitle className="profile-confirm-title">Hủy kết bạn?</DialogTitle>

        <DialogContent>
          <Typography className="profile-confirm-desc">
            Bạn có chắc muốn hủy kết bạn với {selectedFriendName} không?
          </Typography>
        </DialogContent>

        <DialogActions className="profile-confirm-actions">
          <Button
            className="profile-secondary-btn"
            onClick={() => setOpenUnfriendDialog(false)}
            disabled={selectedFriendLoading}
          >
            Hủy
          </Button>

          <Button className="profile-danger-btn" onClick={handleConfirmUnfriend} disabled={selectedFriendLoading}>
            {selectedFriendLoading ? 'Đang xử lý...' : 'Hủy kết bạn'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default ProfileFriendsTab;
