import { Box, Button, Paper, Typography } from '@mui/material';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ViewAgendaRoundedIcon from '@mui/icons-material/ViewAgendaRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';

type Props = {
  isOwner: boolean;
};

function ProfileTimelineHeader({ isOwner }: Props) {
  return (
    <Paper className="profile-timeline-header" elevation={0}>
      <Box className="profile-timeline-top">
        <Typography className="profile-section-title">Bài viết</Typography>

        <Box className="profile-timeline-tools">
          <Button className="profile-light-btn" startIcon={<TuneRoundedIcon />}>
            Bộ lọc
          </Button>

          {isOwner ? (
            <Button className="profile-light-btn" startIcon={<SettingsRoundedIcon />}>
              Quản lý bài viết
            </Button>
          ) : null}
        </Box>
      </Box>

      <Box className="profile-view-switcher">
        <button type="button" className="profile-view-mode active">
          <ViewAgendaRoundedIcon fontSize="small" />
          Chế độ xem danh sách
        </button>
        <button type="button" className="profile-view-mode">
          <GridViewRoundedIcon fontSize="small" />
          Chế độ xem lưới
        </button>
      </Box>
    </Paper>
  );
}

export default ProfileTimelineHeader;
