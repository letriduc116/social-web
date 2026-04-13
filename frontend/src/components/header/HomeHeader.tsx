import { useEffect, useRef, useState } from 'react';
import { AppBar, Toolbar, Box, IconButton, InputBase, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import MessengerOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

import MenuDropdown from './menus/MenuDropdown';
import MessengerMenu from './menus/MessengerMenu';
import NotificationMenu from './menus/NotificationMenu';
import AccountMenu from './menus/AccountMenu';
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

function HomeHeader() {
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <AppBar position="sticky" color="inherit" elevation={1} className="fb-header-appbar">
      <Toolbar className="fb-header-toolbar" ref={headerRef}>
        <Box className="fb-header-left">
          <Box className="fb-brand" component="a" href="/">
            <Box className="fb-brand-logo">
              <SmartToyOutlinedIcon />
            </Box>
            <span className="fb-brand-title">Ducky</span>
          </Box>

          <Box className="fb-search-box">
            <SearchIcon fontSize="small" />
            <InputBase placeholder="Tìm kiếm trên Ducky" fullWidth />
          </Box>
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
              <NotificationsNoneRoundedIcon />
            </IconButton>
            {openMenu === 'notifications' && <NotificationMenu />}
          </Box>

          <Box className="fb-action-wrapper">
            <IconButton
              className={`fb-action-btn ${openMenu === 'account' ? 'active' : ''}`}
              onClick={() => toggleMenu('account')}
            >
              <AccountCircleOutlinedIcon />
            </IconButton>
            {openMenu === 'account' && <AccountMenu />}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default HomeHeader;
