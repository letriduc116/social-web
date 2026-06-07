import { useEffect, useState, type MouseEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useMiniChat } from '../../services/miniChatStore';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ReportGmailerrorredOutlinedIcon from '@mui/icons-material/ReportGmailerrorredOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import type { FriendshipStatus } from '../../types/friend';

type ProfileActionsProps = {
  isOwner: boolean;
  friendshipStatus: FriendshipStatus;
  isFollowing?: boolean;
  loading?: boolean;
  onFriendAction: () => void;
  onUnfollowFriend?: () => Promise<void> | void;
  onFollowFriendAgain?: () => Promise<void> | void;
  onUnfriend?: () => Promise<void> | void;
  onEditProfile: () => void;
  onMessage: () => void;
  onReportProfile?: (reasonId: string) => Promise<void> | void;
};

type ReportReason = {
  id: string;
  title: string;
  description: string;
};

const PROFILE_REPORT_REASONS: ReportReason[] = [
  {
    id: 'fake_profile',
    title: 'Trang cá nhân giả',
    description: 'Trang này có thể đang mạo danh người khác hoặc dùng danh tính không đúng.',
  },
  {
    id: 'false_information_or_scam',
    title: 'Thông tin sai sự thật, lừa đảo hoặc gian lận',
    description: 'Tài khoản có dấu hiệu mạo danh, lừa đảo, phát tán thông tin sai lệch hoặc spam.',
  },
  {
    id: 'harassment_or_abuse',
    title: 'Bắt nạt, quấy rối hoặc lạm dụng',
    description: 'Người này có hành vi công kích, đe dọa, làm phiền hoặc xúc phạm người khác.',
  },
  {
    id: 'something_else',
    title: 'Vấn đề khác',
    description: 'Một vấn đề khác không nằm trong các lựa chọn trên.',
  },
];

function ProfileActions({
  isOwner,
  friendshipStatus,
  isFollowing = false,
  loading = false,
  onFriendAction,
  onUnfollowFriend,
  onFollowFriendAgain,
  onUnfriend,
  onEditProfile,
  onMessage,
  onReportProfile,
}: ProfileActionsProps) {
  const { userId } = useParams<{ userId: string }>();
  const { openMiniChat } = useMiniChat();

  const handleMessageClick = () => {
    if (userId) {
      void openMiniChat(userId);
      return;
    }

    onMessage?.();
  };

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);
  const [openUnfriendDialog, setOpenUnfriendDialog] = useState(false);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const menuOpen = Boolean(menuAnchor);
  const moreMenuOpen = Boolean(moreMenuAnchor);

  const closeMenu = () => setMenuAnchor(null);
  const closeMoreMenu = () => setMoreMenuAnchor(null);

  const openFriendMenu = (event: MouseEvent<HTMLElement>) => {
    if (loading || submitting) return;
    setMenuAnchor(event.currentTarget);
  };

  const openMoreMenu = (event: MouseEvent<HTMLElement>) => {
    if (loading || submitting) return;
    setMoreMenuAnchor(event.currentTarget);
  };

  useEffect(() => {
    if (!openReportDialog) {
      setSelectedReportReason('');
      setReportSubmitted(false);
      setReportSubmitting(false);
    }
  }, [openReportDialog]);

  const handleToggleFollow = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      if (isFollowing) {
        await onUnfollowFriend?.();
      } else {
        await onFollowFriendAgain?.();
      }

      closeMenu();
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmUnfriend = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      await onUnfriend?.();
      setOpenUnfriendDialog(false);
      closeMenu();
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReportDialog = () => {
    closeMoreMenu();
    setOpenReportDialog(true);
  };

  const handleSubmitReport = async () => {
    if (!selectedReportReason || reportSubmitting) return;

    try {
      setReportSubmitting(true);
      await onReportProfile?.(selectedReportReason);
      setReportSubmitted(true);
    } finally {
      setReportSubmitting(false);
    }
  };

  const renderMoreMenu = () => (
    <Menu
      anchorEl={moreMenuAnchor}
      open={moreMenuOpen}
      onClose={closeMoreMenu}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{ className: 'profile-actions-menu profile-more-menu-paper' }}
    >
      {!isOwner ? (
        <MenuItem className="profile-actions-menu-item" onClick={handleOpenReportDialog}>
          <ListItemIcon>
            <ReportGmailerrorredOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={<Typography className="profile-menu-title">Báo cáo trang cá nhân</Typography>} />
        </MenuItem>
      ) : null}
    </Menu>
  );

  const renderReportDialog = () => (
    <Dialog
      open={openReportDialog}
      onClose={() => setOpenReportDialog(false)}
      fullWidth
      maxWidth="sm"
      PaperProps={{ className: 'profile-report-dialog' }}
    >
      <Box className="profile-report-header">
        <Typography className="profile-report-title">Báo cáo</Typography>
        <IconButton className="profile-report-close" onClick={() => setOpenReportDialog(false)}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      <Divider />

      <DialogContent className="profile-report-content">
        {reportSubmitted ? (
          <Box className="profile-report-success">
            <CheckCircleOutlineRoundedIcon />
            <Typography className="profile-report-success-title">Cảm ơn bạn đã báo cáo</Typography>
            <Typography className="profile-report-success-desc">
              Báo cáo trang cá nhân này đã được ghi nhận trên giao diện. Khi có API kiểm duyệt, bạn có thể gửi lý do
              này về backend.
            </Typography>
            <Button className="profile-primary-btn" fullWidth onClick={() => setOpenReportDialog(false)}>
              Xong
            </Button>
          </Box>
        ) : (
          <>
            <Box className="profile-report-intro">
              <Typography className="profile-report-question">Tại sao bạn báo cáo trang cá nhân này?</Typography>
              <Typography className="profile-report-desc">
                Nếu bạn nhận thấy ai đó đang gặp nguy hiểm, đừng chần chừ mà hãy tìm ngay sự giúp đỡ trước khi báo cáo.
              </Typography>
            </Box>

            <Box className="profile-report-reason-list">
              {PROFILE_REPORT_REASONS.map((reason) => {
                const active = selectedReportReason === reason.id;
                return (
                  <button
                    className={`profile-report-reason ${active ? 'active' : ''}`}
                    type="button"
                    key={reason.id}
                    onClick={() => setSelectedReportReason(reason.id)}
                  >
                    <Box>
                      <Typography className="profile-report-reason-title">{reason.title}</Typography>
                      <Typography className="profile-report-reason-desc">{reason.description}</Typography>
                    </Box>
                    <ChevronRightOutlinedIcon />
                  </button>
                );
              })}
            </Box>

            <Button
              className="profile-primary-btn profile-report-submit"
              fullWidth
              disabled={!selectedReportReason || reportSubmitting}
              onClick={handleSubmitReport}
            >
              {reportSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );

  if (isOwner) {
    return (
      <Box className="profile-actions">
        <Button className="profile-secondary-btn" startIcon={<EditRoundedIcon />} onClick={onEditProfile}>
          Chỉnh sửa trang cá nhân
        </Button>

        <Button className="profile-more-btn">
          <MoreHorizRoundedIcon />
        </Button>
      </Box>
    );
  }

  const renderFriendButton = () => {
    if (friendshipStatus === 'FRIEND') {
      return (
        <>
          <Button
            className="profile-secondary-btn"
            startIcon={<CheckRoundedIcon />}
            endIcon={<KeyboardArrowDownRoundedIcon />}
            onClick={openFriendMenu}
            disabled={loading || submitting}
          >
            Bạn bè
          </Button>

          <Menu
            anchorEl={menuAnchor}
            open={menuOpen}
            onClose={closeMenu}
            PaperProps={{ className: 'profile-actions-menu' }}
          >
            <MenuItem className="profile-actions-menu-item">
              <ListItemIcon>
                <StarRoundedIcon />
              </ListItemIcon>
              <ListItemText
                primary={<Typography className="profile-menu-title">Yêu thích</Typography>}
                secondary={<Typography className="profile-menu-desc">Ưu tiên nhìn thấy bài viết của người này.</Typography>}
              />
            </MenuItem>

            <MenuItem className="profile-actions-menu-item" onClick={handleToggleFollow} disabled={submitting}>
              <ListItemIcon>
                {isFollowing ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography className="profile-menu-title">
                    {isFollowing ? 'Bỏ theo dõi' : 'Theo dõi lại'}
                  </Typography>
                }
                secondary={
                  <Typography className="profile-menu-desc">
                    {isFollowing
                      ? 'Bạn vẫn là bạn bè nhưng sẽ ít thấy bài viết của người này.'
                      : 'Bạn sẽ nhìn thấy bài viết của người này trên bảng tin.'}
                  </Typography>
                }
              />
            </MenuItem>

            <Divider />

            <MenuItem
              className="profile-actions-menu-item profile-actions-danger-item"
              onClick={() => setOpenUnfriendDialog(true)}
              disabled={submitting}
            >
              <ListItemIcon>
                <PersonRemoveRoundedIcon />
              </ListItemIcon>
              <ListItemText
                primary={<Typography className="profile-menu-title">Hủy kết bạn</Typography>}
                secondary={<Typography className="profile-menu-desc">Hai bạn sẽ không còn trong danh sách bạn bè của nhau.</Typography>}
              />
            </MenuItem>
          </Menu>

          <Dialog
            open={openUnfriendDialog}
            onClose={() => !submitting && setOpenUnfriendDialog(false)}
            fullWidth
            maxWidth="xs"
            PaperProps={{ className: 'profile-confirm-dialog' }}
          >
            <DialogTitle className="profile-confirm-title">Hủy kết bạn?</DialogTitle>

            <DialogContent>
              <Typography className="profile-confirm-desc">
                Bạn có chắc muốn hủy kết bạn với người này không? Hai bạn sẽ không còn trong danh sách bạn bè của nhau.
              </Typography>
            </DialogContent>

            <DialogActions className="profile-confirm-actions">
              <Button
                className="profile-secondary-btn"
                onClick={() => setOpenUnfriendDialog(false)}
                disabled={submitting}
              >
                Hủy
              </Button>

              <Button className="profile-danger-btn" onClick={handleConfirmUnfriend} disabled={submitting}>
                {submitting ? 'Đang xử lý...' : 'Hủy kết bạn'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      );
    }

    if (friendshipStatus === 'PENDING_SENT') {
      return (
        <Button
          className="profile-secondary-btn"
          startIcon={<HourglassEmptyRoundedIcon />}
          onClick={onFriendAction}
          disabled={loading}
        >
          Đã gửi lời mời
        </Button>
      );
    }

    if (friendshipStatus === 'PENDING_RECEIVED') {
      return (
        <Button
          className="profile-primary-btn"
          startIcon={<CheckRoundedIcon />}
          onClick={onFriendAction}
          disabled={loading}
        >
          Chấp nhận
        </Button>
      );
    }

    return (
      <Button
        className="profile-primary-btn"
        startIcon={<PersonAddAlt1RoundedIcon />}
        onClick={onFriendAction}
        disabled={loading}
      >
        Thêm bạn bè
      </Button>
    );
  };

  return (
    <Box className="profile-actions">
      {renderFriendButton()}

      <Button className="profile-message-btn" startIcon={<ChatBubbleRoundedIcon />} onClick={handleMessageClick}>
        Nhắn tin
      </Button>

      <Button className="profile-more-btn" onClick={openMoreMenu}>
        <MoreHorizRoundedIcon />
      </Button>
      {renderMoreMenu()}
      {renderReportDialog()}
    </Box>
  );
}

export default ProfileActions;
