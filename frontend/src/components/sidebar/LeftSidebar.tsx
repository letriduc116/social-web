import { Paper, Typography, List, ListItemButton, ListItemText } from '@mui/material';

const quickLinks = ['Trang cá nhân', 'Bạn bè', 'Kỷ niệm', 'Đã lưu', 'Sự kiện', 'Marketplace'];

function LeftSidebar() {
  return (
    <Paper className="ducky-sidebar left-sidebar" elevation={0}>
      <Typography variant="h6" className="sidebar-title">
        Lối tắt
      </Typography>

      <List disablePadding>
        {quickLinks.map((link) => (
          <ListItemButton key={link}>
            <ListItemText primary={link} />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}

export default LeftSidebar;
