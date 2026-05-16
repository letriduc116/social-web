import { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import HeaderMenu from './HeaderMenu';
import type { NotificationResponse } from '../../../types/notification';

type NotificationMenuProps = {
  notifications: NotificationResponse[];
  loading?: boolean;
  respondingRequestIds?: string[];
  onMarkRead?: (notification: NotificationResponse) => void;
  onAcceptFriendRequest?: (notification: NotificationResponse) => void;
  onDeclineFriendRequest?: (notification: NotificationResponse) => void;
};

const getDisplayName = (notification: NotificationResponse) => {
  return notification.senderFullName || notification.senderUserName || notification.title || 'Ducky';
};

const formatTime = (value?: string) => {
  if (!value) return '';

  const createdAt = new Date(value).getTime();
  const now = Date.now();
  const diffMs = now - createdAt;

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày`;

  return new Date(value).toLocaleDateString('vi-VN');
};

function NotificationMenu({
  notifications,
  loading = false,
  respondingRequestIds = [],
  onMarkRead,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
}: NotificationMenuProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((item) => !item.read);
    }

    return notifications;
  }, [notifications, filter]);

  return (
    <HeaderMenu title="Thông báo" className="fb-notification-menu">
      <Box className="fb-chip-row">
        <Chip
          label="Tất cả"
          color={filter === 'all' ? 'primary' : 'default'}
          variant={filter === 'all' ? 'filled' : 'outlined'}
          onClick={() => setFilter('all')}
        />

        <Chip
          label="Chưa đọc"
          color={filter === 'unread' ? 'primary' : 'default'}
          variant={filter === 'unread' ? 'filled' : 'outlined'}
          onClick={() => setFilter('unread')}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 2 }}>
          <CircularProgress size={22} />
          <Typography variant="body2">Đang tải thông báo...</Typography>
        </Box>
      ) : null}

      {!loading && filteredNotifications.length === 0 ? (
        <Box sx={{ px: 2, py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Chưa có thông báo nào.
          </Typography>
        </Box>
      ) : null}

      <List disablePadding>
        {filteredNotifications.map((item) => {
          const displayName = getDisplayName(item);
          const avatarText = displayName.charAt(0).toUpperCase();
          const isFriendRequest = item.type === 'FRIEND_REQUEST' && Boolean(item.referenceId);
          const isResponding = item.referenceId ? respondingRequestIds.includes(item.referenceId) : false;

          return (
            <ListItemButton
              key={item.id}
              className={`fb-notification-item ${!item.read ? 'is-unread' : ''}`}
              alignItems="flex-start"
              onClick={() => onMarkRead?.(item)}
            >
              <ListItemAvatar>
                <Avatar src={item.senderAvatar || undefined} sx={{ bgcolor: '#1976d2' }}>
                  {avatarText}
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Box>
                    <Typography variant="body2">
                      <strong>{displayName}</strong>{' '}
                      {item.title.replace(displayName, '').trim() || item.message || ''}
                    </Typography>

                    {isFriendRequest ? (
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={isResponding}
                          onClick={(event) => {
                            event.stopPropagation();
                            onAcceptFriendRequest?.(item);
                          }}
                        >
                          {isResponding ? 'ĐANG XỬ LÝ' : 'CHẤP NHẬN'}
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          disabled={isResponding}
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeclineFriendRequest?.(item);
                          }}
                        >
                          TỪ CHỐI
                        </Button>
                      </Box>
                    ) : null}
                  </Box>
                }
                secondary={formatTime(item.createdAt)}
              />
            </ListItemButton>
          );
        })}
      </List>
    </HeaderMenu>
  );
}

export default NotificationMenu;
