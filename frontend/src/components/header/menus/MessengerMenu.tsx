import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputBase,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import HeaderMenu from './HeaderMenu';
import { useMiniChat } from '../../../services/miniChatStore';

type MessengerMenuProps = {
  onClose?: () => void;
};

function MessengerMenu({ onClose }: MessengerMenuProps) {
  const { conversations, loadingConversations, openMiniChat, refreshConversations } = useMiniChat();

  useEffect(() => {
    void refreshConversations();
  }, [refreshConversations]);

  const handleOpenConversation = (conversationId: string) => {
    void openMiniChat(conversationId);
    onClose?.();
  };

  return (
    <HeaderMenu title="Đoạn chat" className="fb-messenger-menu">
      <Box className="fb-menu-search">
        <SearchIcon fontSize="small" />
        <InputBase placeholder="Tìm kiếm trên Messenger" fullWidth />
      </Box>

      <Box className="fb-chip-row">
        <Chip label="Tất cả" color="primary" variant="filled" />
        <Chip label="Chưa đọc" variant="outlined" />
        <Chip label="Nhóm" variant="outlined" />
      </Box>

      <List disablePadding>
        {loadingConversations && conversations.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={22} />
          </Box>
        )}

        {!loadingConversations && conversations.length === 0 && (
          <Box sx={{ px: 2, py: 2, color: 'text.secondary' }}>Chưa có đoạn chat phù hợp.</Box>
        )}

        {conversations.slice(0, 4).map((conversation) => (
          <ListItemButton
            key={conversation.id}
            className="fb-message-item"
            onClick={() => handleOpenConversation(conversation.id)}
          >
            <ListItemAvatar>
              <Avatar src={conversation.avatarUrl || undefined} sx={{ bgcolor: conversation.avatarColor }}>
                {conversation.name.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={conversation.name}
              secondary={`${conversation.typing ? 'Đang nhập...' : conversation.lastMessage} · ${
                conversation.lastMessageAt || 'Vừa xong'
              }`}
            />
          </ListItemButton>
        ))}
      </List>

      <Button fullWidth className="fb-menu-footer-btn" component={Link} to="/messages" onClick={onClose}>
        Xem tất cả trong Messenger
      </Button>
    </HeaderMenu>
  );
}

export default MessengerMenu;
