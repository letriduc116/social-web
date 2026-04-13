import { List, ListItemButton, ListItemAvatar, Avatar, ListItemText, Box, Chip, Typography } from '@mui/material';
import HeaderMenu from './HeaderMenu';

const notifications = [
  {
    name: 'Ann Nguyễn',
    text: 'đã chấp nhận lời mời kết bạn của bạn.',
    time: '6 ngày',
    color: '#d32f2f',
  },
  {
    name: 'Ôn Thi Anh Văn',
    text: 'đã nhắc đến bạn và những người khác ở bình luận của họ.',
    time: '1 tuần',
    color: '#2e7d32',
  },
  {
    name: 'Chuyên đề Java',
    text: 'đã thay đổi quyền riêng tư của nhóm.',
    time: '1 tuần',
    color: '#1976d2',
  },
];

function NotificationMenu() {
  return (
    <HeaderMenu title="Thông báo" className="fb-notification-menu">
      <Box className="fb-chip-row">
        <Chip label="Tất cả" color="primary" variant="filled" />
        <Chip label="Chưa đọc" variant="outlined" />
      </Box>

      <List disablePadding>
        {notifications.map((item) => (
          <ListItemButton key={`${item.name}-${item.time}`} className="fb-notification-item">
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: item.color }}>{item.name.charAt(0)}</Avatar>
            </ListItemAvatar>

            <ListItemText
              primary={
                <Typography variant="body2">
                  <strong>{item.name}</strong> {item.text}
                </Typography>
              }
              secondary={item.time}
            />
          </ListItemButton>
        ))}
      </List>
    </HeaderMenu>
  );
}

export default NotificationMenu;
