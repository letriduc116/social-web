import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Skeleton,
  Snackbar,
  Typography,
} from '@mui/material';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded';

import HomeHeader from '../components/header/HomeHeader';
import { friendService } from '../services/friendService';
import type { FriendRequestResponse } from '../types/friend';
import '../styles/friends.css';

const formatTime = (value?: string) => {
  if (!value) return 'Vừa xong';

  const createdAt = new Date(value).getTime();
  const now = Date.now();
  const diffMs = now - createdAt;

  if (Number.isNaN(createdAt)) return 'Vừa xong';

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return new Date(value).toLocaleDateString('vi-VN');
};

const getRequesterName = (request: FriendRequestResponse) => {
  return request.requesterFullName || request.requesterUserName || 'Người dùng Ducky';
};

function FriendRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<FriendRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondingIds, setRespondingIds] = useState<string[]>([]);
  const [toast, setToast] = useState('');

  const pendingRequests = useMemo(() => requests.filter((item) => item.status === 'PENDING'), [requests]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await friendService.getReceivedRequests();
      setRequests(response);
    } catch (fetchError) {
      console.error(fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Không tải được lời mời kết bạn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  const removeRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((item) => item.id !== requestId));
    window.dispatchEvent(new CustomEvent('ducky:friend-requests-changed'));
  };

  const handleAccept = async (request: FriendRequestResponse) => {
    if (respondingIds.includes(request.id)) return;

    try {
      setRespondingIds((prev) => [...prev, request.id]);
      await friendService.acceptRequest(request.id);
      removeRequest(request.id);
      setToast(`Đã chấp nhận lời mời của ${getRequesterName(request)}`);
    } catch (acceptError) {
      console.error(acceptError);
      setToast(acceptError instanceof Error ? acceptError.message : 'Không thể chấp nhận lời mời');
    } finally {
      setRespondingIds((prev) => prev.filter((id) => id !== request.id));
    }
  };

  const handleDecline = async (request: FriendRequestResponse) => {
    if (respondingIds.includes(request.id)) return;

    try {
      setRespondingIds((prev) => [...prev, request.id]);
      await friendService.declineRequest(request.id);
      removeRequest(request.id);
      setToast(`Đã xóa lời mời của ${getRequesterName(request)}`);
    } catch (declineError) {
      console.error(declineError);
      setToast(declineError instanceof Error ? declineError.message : 'Không thể xóa lời mời');
    } finally {
      setRespondingIds((prev) => prev.filter((id) => id !== request.id));
    }
  };

  const renderSkeletons = () => (
    <Box className="friends-request-grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <Paper className="friend-request-card" key={index} elevation={1}>
          <Skeleton variant="rectangular" className="friend-request-skeleton-cover" />
          <Box className="friend-request-card-body">
            <Skeleton width="72%" height={28} />
            <Skeleton width="46%" height={22} />
            <Skeleton height={42} sx={{ mt: 1 }} />
            <Skeleton height={42} />
          </Box>
        </Paper>
      ))}
    </Box>
  );

  return (
    <div className="ducky-page friends-page-shell">
      <HomeHeader />

      <main className="friends-page-layout">
        <aside className="friends-sidebar-panel">
          <Box className="friends-sidebar-head">
            <Typography className="friends-sidebar-title">Bạn bè</Typography>
            <IconButton className="friends-sidebar-settings" aria-label="Cài đặt bạn bè">
              <SettingsRoundedIcon />
            </IconButton>
          </Box>

          <nav className="friends-sidebar-nav" aria-label="Friends navigation">
            <button type="button" className="friends-sidebar-item active">
              <span className="friends-sidebar-icon primary">
                <GroupsRoundedIcon />
              </span>
              <span>Trang chủ</span>
            </button>

            <button type="button" className="friends-sidebar-item active-soft">
              <span className="friends-sidebar-icon">
                <PersonAddAlt1RoundedIcon />
              </span>
              <span>Lời mời kết bạn</span>
              <ArrowForwardIosRoundedIcon className="friends-sidebar-arrow" />
            </button>

            <button type="button" className="friends-sidebar-item">
              <span className="friends-sidebar-icon">
                <PersonSearchRoundedIcon />
              </span>
              <span>Gợi ý</span>
              <ArrowForwardIosRoundedIcon className="friends-sidebar-arrow" />
            </button>

            <button type="button" className="friends-sidebar-item">
              <span className="friends-sidebar-icon">
                <GroupsRoundedIcon />
              </span>
              <span>Tất cả bạn bè</span>
              <ArrowForwardIosRoundedIcon className="friends-sidebar-arrow" />
            </button>

            <button type="button" className="friends-sidebar-item">
              <span className="friends-sidebar-icon">
                <CakeRoundedIcon />
              </span>
              <span>Sinh nhật</span>
            </button>
          </nav>
        </aside>

        <section className="friends-content-panel">
          <Box className="friends-content-head">
            <Box>
              <Typography className="friends-content-title">Lời mời kết bạn</Typography>
              <Typography className="friends-content-subtitle">
                {loading ? 'Đang tải lời mời...' : `${pendingRequests.length} lời mời đang chờ phản hồi`}
              </Typography>
            </Box>

            <Button
              variant="text"
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshRoundedIcon />}
              onClick={fetchRequests}
              disabled={loading}
              className="friends-refresh-btn"
            >
              Làm mới
            </Button>
          </Box>

          {error ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={fetchRequests}>
                  Thử lại
                </Button>
              }
              className="friends-error-alert"
            >
              {error}
            </Alert>
          ) : null}

          {loading ? renderSkeletons() : null}

          {!loading && !error && pendingRequests.length === 0 ? (
            <Paper className="friends-empty-state" elevation={1}>
              <Box className="friends-empty-icon">
                <SentimentSatisfiedAltRoundedIcon />
              </Box>
              <Typography className="friends-empty-title">Không có lời mời mới</Typography>
              <Typography className="friends-empty-desc">
                Khi ai đó gửi lời mời kết bạn, lời mời sẽ hiển thị ở trang này để bạn chấp nhận hoặc xóa.
              </Typography>
              <Button variant="contained" onClick={() => navigate('/')} className="friends-empty-button">
                Quay về bảng tin
              </Button>
            </Paper>
          ) : null}

          {!loading && !error && pendingRequests.length > 0 ? (
            <Box className="friends-request-grid">
              {pendingRequests.map((request) => {
                const name = getRequesterName(request);
                const avatarText = name.charAt(0).toUpperCase();
                const isResponding = respondingIds.includes(request.id);

                return (
                  <Paper className="friend-request-card" key={request.id} elevation={1}>
                    <button
                      type="button"
                      className="friend-request-cover"
                      onClick={() => navigate(`/profile/${request.requesterId}`)}
                      aria-label={`Xem trang cá nhân của ${name}`}
                    >
                      {request.requesterAvatar ? (
                        <img src={request.requesterAvatar} alt={name} />
                      ) : (
                        <Avatar className="friend-request-cover-avatar">{avatarText}</Avatar>
                      )}
                    </button>

                    <Box className="friend-request-card-body">
                      <button
                        type="button"
                        className="friend-request-name"
                        onClick={() => navigate(`/profile/${request.requesterId}`)}
                      >
                        {name}
                      </button>

                      <Typography className="friend-request-meta">Đã gửi {formatTime(request.createdAt)}</Typography>

                      <Box className="friend-request-actions">
                        <Button
                          variant="contained"
                          fullWidth
                          disabled={isResponding}
                          onClick={() => handleAccept(request)}
                          className="friend-request-confirm-btn"
                        >
                          {isResponding ? 'Đang xử lý...' : 'Xác nhận'}
                        </Button>

                        <Button
                          variant="contained"
                          fullWidth
                          disabled={isResponding}
                          onClick={() => handleDecline(request)}
                          className="friend-request-delete-btn"
                        >
                          Xóa
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          ) : null}
        </section>
      </main>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2600}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
}

export default FriendRequestsPage;
