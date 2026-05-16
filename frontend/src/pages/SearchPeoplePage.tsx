import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Snackbar, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import HomeHeader from '../components/header/HomeHeader';
import SearchFilterSidebar from '../components/search/SearchFilterSidebar';
import SearchUserCard from '../components/search/SearchUserCard';
import { userService } from '../services/userService';
import { friendService } from '../services/friendService';
import type { UserSearchResult } from '../types/user';
import '../styles/search.css';

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

function SearchPeoplePage() {
  const [searchParams] = useSearchParams();

  const keyword = useMemo(() => {
    return searchParams.get('q')?.trim() || '';
  }, [searchParams]);

  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingUserId, setActionLoadingUserId] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    let mounted = true;

    async function fetchUsers() {
      if (!keyword) {
        setUsers([]);
        setError('');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await userService.searchUsers(keyword, 30);

        const dataWithStatus = await Promise.all(
          (data || []).map(async (user) => {
            try {
              const status = await friendService.getFriendshipStatus(user.id);

              return {
                ...user,
                friendshipStatus: status.status,
                requestId: status.requestId,
                isFriend: status.status === 'FRIEND',
              };
            } catch {
              return user;
            }
          }),
        );

        if (!mounted) return;

        setUsers(dataWithStatus);
      } catch (err) {
        console.error(err);

        if (!mounted) return;

        setUsers([]);
        setError(getErrorMessage(err, 'Không thể tìm kiếm người dùng'));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      mounted = false;
    };
  }, [keyword]);

  const handleAddFriend = async (user: UserSearchResult) => {
    const displayName = user.fullName || user.userName || 'người dùng này';

    try {
      setActionLoadingUserId(user.id);

      const request = await friendService.sendRequest(user.id);

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? {
                ...item,
                friendshipStatus: 'PENDING_SENT',
                requestId: request.id,
              }
            : item,
        ),
      );

      setToast(`Đã gửi lời mời kết bạn tới ${displayName}`);
    } catch (err) {
      console.error(err);
      setToast(getErrorMessage(err, 'Không thể gửi lời mời kết bạn'));
    } finally {
      setActionLoadingUserId('');
    }
  };

  const handleAcceptFriend = async (user: UserSearchResult) => {
    if (!user.requestId) {
      setToast('Không tìm thấy mã lời mời kết bạn');
      return;
    }

    const displayName = user.fullName || user.userName || 'người dùng này';

    try {
      setActionLoadingUserId(user.id);

      await friendService.acceptRequest(user.requestId);

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? {
                ...item,
                friendshipStatus: 'FRIEND',
                isFriend: true,
              }
            : item,
        ),
      );

      setToast(`Bạn và ${displayName} đã trở thành bạn bè`);
    } catch (err) {
      console.error(err);
      setToast(getErrorMessage(err, 'Không thể chấp nhận lời mời kết bạn'));
    } finally {
      setActionLoadingUserId('');
    }
  };

  const handleMessage = (user: UserSearchResult) => {
    const displayName = user.fullName || user.userName || 'người dùng này';
    setToast(`Tính năng nhắn tin với ${displayName} sẽ được nối vào module chat sau.`);
  };

  return (
    <div className="ducky-page search-page">
      <HomeHeader />

      <Box className="search-layout">
        <SearchFilterSidebar />

        <main className="search-main">
          <Box className="search-result-shell">
            <Typography className="search-result-title">Mọi người</Typography>

            {keyword ? (
              <Typography className="search-result-subtitle">
                Kết quả tìm kiếm cho: <strong>{keyword}</strong>
              </Typography>
            ) : (
              <Typography className="search-result-subtitle">
                Nhập từ khóa trên thanh tìm kiếm để tìm người dùng.
              </Typography>
            )}

            {loading ? (
              <Box className="search-state">
                <CircularProgress />
                <Typography>Đang tìm kiếm...</Typography>
              </Box>
            ) : null}

            {!loading && error ? <Alert severity="error">{error}</Alert> : null}

            {!loading && !error && keyword && users.length === 0 ? (
              <Box className="search-empty-state">
                <Typography className="search-empty-title">Không tìm thấy người dùng phù hợp</Typography>
                <Typography className="search-empty-desc">
                  Hãy thử kiểm tra chính tả hoặc tìm bằng tên người dùng khác.
                </Typography>
              </Box>
            ) : null}

            {!loading && !error && users.length > 0 ? (
              <Box className="search-user-list">
                {users.map((user) => (
                  <SearchUserCard
                    key={user.id}
                    user={user}
                    actionLoading={actionLoadingUserId === user.id}
                    onAddFriend={handleAddFriend}
                    onAcceptFriend={handleAcceptFriend}
                    onMessage={handleMessage}
                  />
                ))}
              </Box>
            ) : null}
          </Box>
        </main>
      </Box>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2800}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
}

export default SearchPeoplePage;
