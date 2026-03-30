import {
  Avatar,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import HeaderMenu from './HeaderMenu';

function AccountMenu() {
  return (
    <HeaderMenu className="fb-account-menu">
      <Paper elevation={2} className="fb-account-card">
        <Avatar sx={{ width: 48, height: 48, bgcolor: '#90a4ae' }}>T</Avatar>
        <Box>
          <Typography fontWeight={700}>Trí Đức</Typography>
          <Typography variant="body2" color="text.secondary">
            Xem tất cả trang cá nhân
          </Typography>
        </Box>
      </Paper>

      <Divider />

      <List disablePadding>
        <ListItemButton>
          <ListItemIcon>
            <SettingsOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Cài đặt và quyền riêng tư" />
          <ChevronRightOutlinedIcon />
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <HelpOutlineOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Trợ giúp và hỗ trợ" />
          <ChevronRightOutlinedIcon />
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <DarkModeOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Màn hình và trợ năng" />
          <ChevronRightOutlinedIcon />
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <FeedbackOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Đóng góp ý kiến" />
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Đăng xuất" />
        </ListItemButton>
      </List>
    </HeaderMenu>
  );
}

export default AccountMenu;
