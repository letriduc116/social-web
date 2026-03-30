import { Paper, Typography, List, ListItem, Avatar, Box } from '@mui/material';

const contacts = ['Vịt Vàng', 'Vịt Trắng', 'Ngỗng Hồng', 'Thiên Nga Xám'];

function RightSidebar() {
  return (
    <Paper className="ducky-sidebar right-sidebar" elevation={0}>
      <Typography variant="h6" className="sidebar-title">
        Người liên hệ
      </Typography>

      <List disablePadding>
        {contacts.map((contact) => (
          <ListItem key={contact} className="contact-item">
            <Box className="contact-avatar-wrap">
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#42a5f5' }}>{contact.charAt(0)}</Avatar>
              <span className="status-dot" />
            </Box>
            <span>{contact}</span>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default RightSidebar;
