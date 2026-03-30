import { List, ListItemButton, ListItemIcon, ListItemText, Typography, Box, Divider } from '@mui/material';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import MovieCreationOutlinedIcon from '@mui/icons-material/MovieCreationOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import HeaderMenu from './HeaderMenu';

function MenuDropdown() {
  return (
    <HeaderMenu title="Menu" className="fb-menu-dropdown fb-menu-grid-dropdown">
      <Box className="fb-menu-grid">
        <Box className="fb-menu-section">
          <Typography variant="subtitle1" className="fb-menu-section-title">
            Tạo
          </Typography>

          <List disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <PostAddOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Bài viết" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <MovieCreationOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Thước phim" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <GroupOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Nhóm" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <CampaignOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Quảng cáo" />
            </ListItemButton>
          </List>
        </Box>

        <Box className="fb-menu-section">
          <Typography variant="subtitle1" className="fb-menu-section-title">
            Cá nhân
          </Typography>

          <List disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <HistoryOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Kỷ niệm" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <StorefrontOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Marketplace" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <PeopleAltOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Bạn bè" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <NotificationsOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Thông báo" />
            </ListItemButton>
          </List>
        </Box>
      </Box>

      <Divider />
    </HeaderMenu>
  );
}

export default MenuDropdown;
