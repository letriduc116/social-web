import {
  Box,
  InputBase,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HeaderMenu from './HeaderMenu';

const messages = [
  { name: 'Ann Nguyễn', text: 'Ừa Đức biết đi đánh mà · 9 giờ', color: '#d32f2f' },
  { name: 'NguyễnQ Hiếu', text: 'Hiếu đã gửi một file đính kèm · 10 giờ', color: '#1976d2' },
  { name: 'Minh Anh', text: 'Bạn đã gửi một nhãn dán · 21 giờ', color: '#388e3c' },
];

function MessengerMenu() {
  return (
    <HeaderMenu title="Đoạn chat" className="fb-messenger-menu">
      <Box className="fb-menu-search">
        <SearchIcon fontSize="small" />
        <InputBase placeholder="Tìm kiếm trên Messenger" fullWidth />
      </Box>

      <Box className="fb-chip-row">
        <Chip label="Tất cả" color="primary" variant="filled" />
        <Chip label="Chưa đọc" variant="outlined" />
        <Chip label="Nhóm" variant="outlined" />
      </Box>

      <List disablePadding>
        {messages.map((item) => (
          <ListItemButton key={item.name} className="fb-message-item">
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: item.color }}>{item.name.charAt(0)}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={item.name} secondary={item.text} />
          </ListItemButton>
        ))}
      </List>

      <Button fullWidth className="fb-menu-footer-btn">
        Xem tất cả trong Messenger
      </Button>
    </HeaderMenu>
  );
}

export default MessengerMenu;
