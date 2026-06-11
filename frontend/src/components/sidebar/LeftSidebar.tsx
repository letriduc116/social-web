import type { ReactNode } from 'react';
import { Paper, Typography, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import BookmarkAddedOutlinedIcon from '@mui/icons-material/BookmarkAddedOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { useLocation, useNavigate } from 'react-router-dom';

type QuickLink = {
  label: string;
  path?: string;
  icon: ReactNode;
};

const quickLinks: QuickLink[] = [
  { label: 'Trang chủ', path: '/home', icon: <HomeOutlinedIcon /> },
  { label: 'Trang cá nhân', path: '/profile', icon: <PersonOutlineOutlinedIcon /> },
  { label: 'Bạn bè', path: '/search/people', icon: <PeopleAltOutlinedIcon /> },
  { label: 'Kỷ niệm', icon: <HistoryOutlinedIcon /> },
  { label: 'Đã lưu', path: '/saved', icon: <BookmarkAddedOutlinedIcon /> },
  { label: 'Sự kiện', icon: <EventOutlinedIcon /> },
  { label: 'Marketplace', icon: <StorefrontOutlinedIcon /> },
];

function isActivePath(currentPath: string, targetPath?: string) {
  if (!targetPath) return false;
  if (targetPath === '/') return currentPath === '/';
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

function LeftSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Paper className="ducky-sidebar left-sidebar" elevation={0}>
      <Typography variant="h6" className="sidebar-title">
        Lối tắt
      </Typography>

      <List disablePadding>
        {quickLinks.map((link) => {
          const active = isActivePath(location.pathname, link.path);

          return (
            <ListItemButton
              key={link.label}
              selected={active}
              disabled={!link.path}
              onClick={() => {
                if (link.path) navigate(link.path);
              }}
              sx={{
                minHeight: 48,
                borderRadius: '10px',
                px: 1.25,
                mb: 0.25,
                color: active ? '#1877f2' : '#050505',
                '&.Mui-selected': {
                  bgcolor: '#e7f3ff',
                  color: '#1877f2',
                },
                '&.Mui-selected:hover': {
                  bgcolor: '#dbeeff',
                },
                '&:hover': {
                  bgcolor: '#f0f2f5',
                },
                '&.Mui-disabled': {
                  opacity: 0.72,
                  color: '#65676b',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 38,
                  color: active ? '#1877f2' : 'inherit',
                  '& svg': { fontSize: 24 },
                }}
              >
                {link.icon}
              </ListItemIcon>

              <ListItemText
                primary={link.label}
                primaryTypographyProps={{
                  fontSize: 15,
                  fontWeight: active ? 700 : 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
}

export default LeftSidebar;
