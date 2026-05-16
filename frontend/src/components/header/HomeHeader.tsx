import { useEffect, useRef, useState } from 'react';
import { AppBar, Toolbar, Box, IconButton, Tooltip, Avatar, Badge, Snackbar } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import MessengerOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';

import MenuDropdown from './menus/MenuDropdown';
import MessengerMenu from './menus/MessengerMenu';
import NotificationMenu from './menus/NotificationMenu';
import AccountMenu from './menus/AccountMenu';
import HeaderUserSearch from './search/HeaderUserSearch';
import type { NotificationResponse } from '../../types/notification';
import { notificationService } from '../../services/notificationService';
import { friendService } from '../../services/friendService';
import { connectNotificationSocket } from '../../services/notificationSocket';
import { authStorage } from '../../services/authStorage';
import { userService } from '../../services/userService';

import '../../styles/header.css';
import '../../styles/menus.css';

const navItems = [
  { key: 'home', label: 'Trang chủ', icon: <HomeOutlinedIcon /> },
  { key: 'friends', label: 'Bạn bè', icon: <GroupsOutlinedIcon /> },
  { key: 'videos', label: 'Video', icon: <OndemandVideoOutlinedIcon /> },
  { key: 'groups', label: 'Nhóm', icon: <GroupsOutlinedIcon /> },
  { key: 'market', label: 'Marketplace', icon: <StorefrontOutlinedIcon /> },
] as const;

type MenuKey = 'menu' | 'messages' | 'notifications' | 'account' | null;

type HeaderUser = {
  fullName: string;
  profileImage: string;
};

function HomeHeader() {
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [headerUser, setHeaderUser] = useState<HeaderUser>({
    fullName: authStorage.getCurrentUserName(),
    profileImage: authStorage.getCurrentProfileImage(),
  });
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [respondingRequestIds, setRespondingRequestIds] = useState<string[]>([]);
  const [toast, setToast] = useState('');

  const headerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function syncCurrentUser() {
      try {
        const currentUserId = authStorage.getCurrentUserId();
        const profile = await userService.getProfile(currentUserId);

        if (!mounted) return;

        setHeaderUser({
          fullName: profile.fullName || profile.userName || authStorage.getCurrentUserName(),
          profileImage: profile.avatarUrl || authStorage.getCurrentProfileImage(),
        });
      } catch (error) {
        console.error('Không đồng bộ được user trên header:', error);
      }
    }

    syncCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchNotifications() {
      try {
        setNotificationLoading(true);

        const [notificationData, unreadData] = await Promise.all([
          notificationService.getMyNotifications(),
          notificationService.countUnread(),
        ]);

        if (!mounted) return;

        setNotifications(notificationData);
        setUnreadCount(unreadData);
      } catch (error) {
        console.error('Không tải được thông báo:', error);
      } finally {
        if (mounted) {
          setNotificationLoading(false);
        }
      }
    }

    fetchNotifications();

    const disconnect = connectNotificationSocket(
      (notification) => {
        setNotifications((prev) => {
          // Nếu BE gửi lời mời mới từ cùng sender, xóa lời mời cũ của sender đó trên FE để tránh trùng UI.
          if (notification.type === 'FRIEND_REQUEST' && notification.senderId) {
            return [
              notification,
              ...prev.filter(
                (item) =>
                  item.id !== notification.id &&
                  !(item.type === 'FRIEND_REQUEST' && item.senderId === notification.senderId),
              ),
            ].slice(0, 30);
          }

          return [notification, ...prev.filter((item) => item.id !== notification.id)].slice(0, 30);
        });

        setUnreadCount((prev) => prev + 1);
      },
      (message) => {
        console.error('WebSocket notification error:', message);
      },
    );

    return () => {
      mounted = false;
      disconnect();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (menu: MenuKey) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const closeMenu = () => {
    setOpenMenu(null);
  };

  const removeFriendRequestNotifications = (notification: NotificationResponse) => {
    const wasUnread = !notification.read;
    const requestId = notification.referenceId;
    const senderId = notification.senderId;

    setNotifications((prev) =>
      prev.filter((item) => {
        if (requestId && item.referenceId === requestId) return false;
        if (senderId && item.type === 'FRIEND_REQUEST' && item.senderId === senderId) return false;
        return item.id !== notification.id;
      }),
    );

    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const avatarText = (headerUser.fullName || 'U').charAt(0).toUpperCase();

  const handleMarkNotificationRead = async (notification: NotificationResponse) => {
    if (notification.read) return;

    try {
      const updatedNotification = await notificationService.markAsRead(notification.id);

      setNotifications((prev) => prev.map((item) => (item.id === notification.id ? updatedNotification : item)));

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Không thể đánh dấu đã đọc:', error);
    }
  };

  const handleAcceptFriendRequest = async (notification: NotificationResponse) => {
    if (!notification.referenceId) return;

    const requestId = notification.referenceId;

    try {
      setRespondingRequestIds((prev) => (prev.includes(requestId) ? prev : [...prev, requestId]));

      await friendService.acceptRequest(requestId);

      // Không gọi markAsRead ở đây vì BE có thể đã xóa notification lời mời sau khi accept.
      removeFriendRequestNotifications(notification);
      setToast('Đã chấp nhận lời mời kết bạn');
    } catch (error) {
      console.error('Không thể chấp nhận lời mời:', error);
      setToast(error instanceof Error ? error.message : 'Không thể chấp nhận lời mời');
    } finally {
      setRespondingRequestIds((prev) => prev.filter((id) => id !== requestId));
    }
  };

  const handleDeclineFriendRequest = async (notification: NotificationResponse) => {
    if (!notification.referenceId) return;

    const requestId = notification.referenceId;

    try {
      setRespondingRequestIds((prev) => (prev.includes(requestId) ? prev : [...prev, requestId]));

      await friendService.declineRequest(requestId);

      // Không gọi markAsRead ở đây vì BE có thể đã xóa notification lời mời sau khi decline.
      removeFriendRequestNotifications(notification);
      setToast('Đã từ chối lời mời kết bạn');
    } catch (error) {
      console.error('Không thể từ chối lời mời:', error);
      setToast(error instanceof Error ? error.message : 'Không thể từ chối lời mời');
    } finally {
      setRespondingRequestIds((prev) => prev.filter((id) => id !== requestId));
    }
  };

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={1} className="fb-header-appbar">
        <Toolbar className="fb-header-toolbar" ref={headerRef}>
          <Box className="fb-header-left">
            <Box className="fb-brand" component="a" href="/">
              <Box className="fb-brand-logo">
                <SmartToyOutlinedIcon />
              </Box>
              <span className="fb-brand-title">Ducky</span>
            </Box>

            <HeaderUserSearch />
          </Box>

          <Box className="fb-header-center">
            {navItems.map((item, index) => (
              <Tooltip title={item.label} key={item.key}>
                <button type="button" className={`fb-nav-btn ${index === 0 ? 'active' : ''}`}>
                  {item.icon}
                </button>
              </Tooltip>
            ))}
          </Box>

          <Box className="fb-header-right">
            <Box className="fb-action-wrapper">
              <IconButton
                className={`fb-action-btn ${openMenu === 'menu' ? 'active' : ''}`}
                onClick={() => toggleMenu('menu')}
              >
                <GridViewRoundedIcon />
              </IconButton>
              {openMenu === 'menu' && <MenuDropdown />}
            </Box>

            <Box className="fb-action-wrapper">
              <IconButton
                className={`fb-action-btn ${openMenu === 'messages' ? 'active' : ''}`}
                onClick={() => toggleMenu('messages')}
              >
                <MessengerOutlineRoundedIcon />
              </IconButton>
              {openMenu === 'messages' && <MessengerMenu />}
            </Box>

            <Box className="fb-action-wrapper">
              <IconButton
                className={`fb-action-btn ${openMenu === 'notifications' ? 'active' : ''}`}
                onClick={() => toggleMenu('notifications')}
              >
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsNoneRoundedIcon />
                </Badge>
              </IconButton>
              {openMenu === 'notifications' && (
                <NotificationMenu
                  notifications={notifications}
                  loading={notificationLoading}
                  respondingRequestIds={respondingRequestIds}
                  onMarkRead={handleMarkNotificationRead}
                  onAcceptFriendRequest={handleAcceptFriendRequest}
                  onDeclineFriendRequest={handleDeclineFriendRequest}
                />
              )}
            </Box>

            <Box className="fb-action-wrapper">
              <IconButton
                className={`fb-action-btn ${openMenu === 'account' ? 'active' : ''}`}
                onClick={() => toggleMenu('account')}
              >
                <Avatar
                  src={headerUser.profileImage || undefined}
                  sx={{ width: 34, height: 34, bgcolor: '#90a4ae', fontSize: 15, fontWeight: 700 }}
                >
                  {avatarText}
                </Avatar>
              </IconButton>

              {openMenu === 'account' && (
                <AccountMenu
                  fullName={headerUser.fullName}
                  profileImage={headerUser.profileImage}
                  avatarText={avatarText}
                  onClose={closeMenu}
                />
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2600}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}

export default HomeHeader;
