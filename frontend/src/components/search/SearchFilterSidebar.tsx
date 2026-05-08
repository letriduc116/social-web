import { Box, Typography } from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';

function SearchFilterSidebar() {
  return (
    <aside className="search-sidebar">
      <Typography className="search-sidebar-title">Tìm kiếm</Typography>

      <Box className="search-sidebar-divider" />

      <Typography className="search-filter-title">Bộ lọc</Typography>

      <button type="button" className="search-filter-item active">
        <span className="search-filter-icon">
          <PeopleAltRoundedIcon />
        </span>
        <span>Mọi người</span>
      </button>
    </aside>
  );
}

export default SearchFilterSidebar;
