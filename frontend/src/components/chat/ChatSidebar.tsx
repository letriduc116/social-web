import { Avatar, Chip, InputBase } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import type { ChatConversation } from '../../types/chat';

type ChatSidebarProps = {
  conversations: ChatConversation[];
  selectedConversationId: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectConversation: (conversationId: string) => void;
};

function ChatSidebar({
  conversations,
  selectedConversationId,
  searchTerm,
  onSearchChange,
  onSelectConversation,
}: ChatSidebarProps) {
  return (
    <aside className="chat-sidebar" aria-label="Danh sách cuộc trò chuyện">
      <div className="chat-sidebar-header">
        <div>
          <p className="chat-eyebrow">Messenger</p>
          <h1>Đoạn chat</h1>
        </div>
        <div className="chat-sidebar-actions" aria-label="Thao tác nhanh">
          <button type="button" aria-label="Tùy chọn Messenger">
            <MoreHorizRoundedIcon />
          </button>
          <button type="button" aria-label="Tạo tin nhắn mới">
            <EditRoundedIcon />
          </button>
        </div>
      </div>

      <label className="chat-search-box">
        <SearchRoundedIcon />
        <InputBase
          placeholder="Tìm kiếm trên Messenger"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          fullWidth
        />
      </label>

      <div className="chat-filter-row" aria-label="Bộ lọc cuộc trò chuyện">
        <Chip label="Hộp thư" color="primary" />
        <Chip label="Chưa đọc" variant="outlined" />
        <Chip label="Nhóm" variant="outlined" />
      </div>

      <div className="chat-list">
        {conversations.length === 0 && <p className="chat-empty-text">Chưa có đoạn chat phù hợp.</p>}

        {conversations.map((conversation) => {
          const isActive = conversation.id === selectedConversationId;

          return (
            <button
              type="button"
              className={`chat-list-item ${isActive ? 'active' : ''}`}
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <span className="chat-avatar-wrap">
                <Avatar src={conversation.avatarUrl || undefined} sx={{ bgcolor: conversation.avatarColor }}>
                  {conversation.name.charAt(0)}
                </Avatar>
                {conversation.status !== 'offline' && <span className={`chat-status-dot ${conversation.status}`} />}
              </span>

              <span className="chat-list-content">
                <span className="chat-list-title-row">
                  <strong>{conversation.name}</strong>
                  <small>{conversation.lastMessageAt}</small>
                </span>
                <span className="chat-list-preview-row">
                  <span className={conversation.unreadCount > 0 ? 'unread' : ''}>
                    {conversation.typing ? 'Đang nhập...' : conversation.lastMessage}
                  </span>
                  {conversation.pinned && <PushPinRoundedIcon fontSize="inherit" />}
                  {conversation.unreadCount > 0 && (
                    <span className="chat-unread-badge" aria-label={`${conversation.unreadCount} tin nhắn chưa đọc`}>
                      {conversation.unreadCount}
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default ChatSidebar;
