import { useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ReportGmailerrorredOutlinedIcon from '@mui/icons-material/ReportGmailerrorredOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import type { PostItem } from '../../types/post';
import { authStorage } from '../../services/authStorage';

type PostOptionsMenuProps = {
  post: PostItem;
  isOwner?: boolean;
  disabled?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleSave?: () => void;
  onReport?: () => void;
  onHide?: () => void;
};

type OptionItemProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  danger?: boolean;
  onClick: () => void;
};

const appFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif';

function OptionItem({ icon, title, subtitle, danger, onClick }: OptionItemProps) {
  return (
    <MenuItem
      disableRipple
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.35,
        minHeight: 'auto',
        whiteSpace: 'normal',
        borderRadius: '10px',
        mx: 0.5,
        my: 0.25,
        px: 1,
        py: 0.95,
        fontFamily: appFont,
        color: danger ? '#d93025' : '#050505',
        transition: 'background-color 120ms ease',
        '&:hover': { bgcolor: '#f0f2f5' },
        '&.Mui-focusVisible': { bgcolor: '#f0f2f5' },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 0,
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          color: danger ? '#d93025' : '#050505',
          flexShrink: 0,
          '& svg': { fontSize: 25 },
        }}
      >
        {icon}
      </ListItemIcon>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          component="div"
          sx={{
            fontFamily: appFont,
            fontSize: 15,
            fontWeight: 650,
            letterSpacing: '-0.01em',
            lineHeight: 1.23,
            color: danger ? '#d93025' : '#050505',
          }}
        >
          {title}
        </Typography>

        {subtitle ? (
          <Typography
            component="div"
            sx={{
              fontFamily: appFont,
              fontSize: 13.5,
              fontWeight: 400,
              lineHeight: 1.28,
              color: '#65676b',
              mt: 0.15,
            }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </MenuItem>
  );
}

function PostOptionsMenu({
  post,
  isOwner,
  disabled,
  onEdit,
  onDelete,
  onToggleSave,
  onReport,
  onHide,
}: PostOptionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const mine = useMemo(() => {
    if (typeof isOwner === 'boolean') return isOwner;
    try {
      return authStorage.getCurrentUserId() === post.user?.id;
    } catch {
      return false;
    }
  }, [isOwner, post.user?.id]);

  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (disabled) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const runAction = (action?: () => void) => {
    handleClose();
    action?.();
  };

  return (
    <>
      <IconButton
        aria-label="Tuỳ chọn bài viết"
        onClick={handleOpen}
        disabled={disabled}
        sx={{
          width: 36,
          height: 36,
          bgcolor: open ? '#e4e6eb' : 'transparent',
          color: '#65676b',
          transition: 'background-color 120ms ease, color 120ms ease',
          '&:hover': { bgcolor: '#f0f2f5', color: '#050505' },
          '& .MuiSvgIcon-root': { fontSize: 23 },
        }}
      >
        <MoreHorizOutlinedIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{
          sx: {
            p: 0,
            fontFamily: appFont,
          },
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.75,
              width: mine ? 360 : 374,
              maxWidth: 'calc(100vw - 28px)',
              borderRadius: '14px',
              overflow: 'visible',
              p: 0.65,
              fontFamily: appFont,
              border: '1px solid rgba(0,0,0,0.08)',
              bgcolor: '#fff',
              boxShadow: '0 12px 28px rgba(0,0,0,0.20), 0 2px 4px rgba(0,0,0,0.10)',
              '& *': {
                fontFamily: appFont,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: -7,
                right: 19,
                width: 14,
                height: 14,
                bgcolor: '#fff',
                transform: 'rotate(45deg)',
                borderLeft: '1px solid rgba(0,0,0,0.05)',
                borderTop: '1px solid rgba(0,0,0,0.05)',
                zIndex: 0,
              },
            },
          },
        }}
      >
        {mine ? (
          <>
            <OptionItem
              icon={<EditOutlinedIcon />}
              title="Chỉnh sửa bài viết"
              subtitle="Thay đổi nội dung hoặc quyền xem của bài viết."
              onClick={() => runAction(onEdit)}
            />
            <OptionItem
              icon={<TuneOutlinedIcon />}
              title="Chỉnh sửa đối tượng"
              subtitle="Cập nhật ai có thể xem bài viết này."
              onClick={() => runAction(onEdit)}
            />
            <Divider sx={{ my: 0.65, mx: 1, borderColor: '#dadde1' }} />
            <OptionItem
              icon={<DeleteOutlineOutlinedIcon />}
              title="Chuyển vào thùng rác"
              subtitle="Bài viết sẽ bị xoá khỏi trang cá nhân của bạn."
              danger
              onClick={() => runAction(onDelete)}
            />
          </>
        ) : (
          <>
            <OptionItem
              icon={post.savedPost ? <BookmarkOutlinedIcon /> : <BookmarkBorderOutlinedIcon />}
              title={post.savedPost ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
              subtitle={post.savedPost ? 'Xoá khỏi danh sách bài viết đã lưu.' : 'Thêm vào danh sách mục đã lưu.'}
              onClick={() => runAction(onToggleSave)}
            />
            <OptionItem
              icon={<VisibilityOffOutlinedIcon />}
              title="Ẩn bài viết"
              subtitle="Bạn sẽ ít nhìn thấy bài viết tương tự hơn."
              onClick={() => runAction(onHide)}
            />
            <OptionItem
              icon={<NotificationsOutlinedIcon />}
              title="Tắt thông báo về bài viết này"
              subtitle="Không nhận thông báo mới từ bài viết này."
              onClick={() => runAction(onHide)}
            />
            <Divider sx={{ my: 0.65, mx: 1, borderColor: '#dadde1' }} />
            <OptionItem
              icon={<ReportGmailerrorredOutlinedIcon />}
              title="Báo cáo bài viết"
              subtitle="Báo cáo nội dung spam, lừa đảo hoặc không phù hợp."
              onClick={() => runAction(onReport)}
            />
          </>
        )}
      </Menu>
    </>
  );
}

export default PostOptionsMenu;
