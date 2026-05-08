import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Box, CircularProgress, IconButton, InputBase, Paper, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useNavigate } from 'react-router-dom';

import { userService } from '../../../services/userService';
import type { UserSearchResult } from '../../../types/user';
import UserSearchResultItem from './UserSearchResultItem';
import '../../../styles/headerSearch.css';

function HeaderUserSearch() {
  const navigate = useNavigate();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  const [keyword, setKeyword] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [error, setError] = useState('');

  const trimmedKeyword = keyword.trim();
  const showDropdown = focused && trimmedKeyword.length > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;

    if (!focused || !trimmedKeyword) {
      setResults([]);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const timer = window.setTimeout(async () => {
      try {
        const data = await userService.searchUsers(trimmedKeyword, 8);

        if (currentRequestId === requestIdRef.current) {
          setResults(data);
        }
      } catch (err) {
        console.error(err);

        if (currentRequestId === requestIdRef.current) {
          setResults([]);
          setError(err instanceof Error ? err.message : 'Không thể tìm kiếm người dùng');
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [trimmedKeyword, focused]);

  const handleCloseSearch = () => {
    setKeyword('');
    setResults([]);
    setError('');
    setFocused(false);
  };

  const handleSelectUser = (user: UserSearchResult) => {
    handleCloseSearch();
    navigate(`/profile/${user.id}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      handleCloseSearch();
      return;
    }

    if (event.key === 'Enter' && trimmedKeyword) {
      event.preventDefault();
      setFocused(false);
      navigate(`/search/people?q=${encodeURIComponent(trimmedKeyword)}`);
    }
  };

  return (
    <Box ref={wrapperRef} className={`fb-header-search ${focused ? 'is-focused' : ''}`}>
      <Box className="fb-header-search-control">
        {focused ? (
          <IconButton className="fb-search-back-btn" size="small" onClick={handleCloseSearch}>
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
        ) : (
          <SearchIcon className="fb-search-leading-icon" fontSize="small" />
        )}

        <InputBase
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm kiếm trên Ducky"
          fullWidth
          inputProps={{ 'aria-label': 'Tìm kiếm người dùng trên Ducky' }}
        />

        {keyword ? (
          <IconButton className="fb-search-clear-btn" size="small" onClick={() => setKeyword('')}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Box>

      {showDropdown ? (
        <Paper elevation={8} className="fb-user-search-panel">
          <Typography className="fb-user-search-heading">Kết quả tìm kiếm</Typography>

          {loading ? (
            <Box className="fb-user-search-state">
              <CircularProgress size={22} />
              <Typography>Đang tìm người dùng...</Typography>
            </Box>
          ) : null}

          {!loading && error ? (
            <Box className="fb-user-search-state">
              <Typography color="error">{error}</Typography>
            </Box>
          ) : null}

          {!loading && !error && results.length === 0 ? (
            <Box className="fb-user-search-state">
              <Typography>Không tìm thấy người dùng phù hợp</Typography>
            </Box>
          ) : null}

          {!loading && !error && results.length > 0 ? (
            <Box className="fb-user-search-list">
              {results.map((user) => (
                <UserSearchResultItem key={user.id} user={user} onClick={handleSelectUser} />
              ))}
            </Box>
          ) : null}
        </Paper>
      ) : null}
    </Box>
  );
}

export default HeaderUserSearch;
