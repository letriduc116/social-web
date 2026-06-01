import { Avatar } from '@mui/material';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ImageSearchOutlinedIcon from '@mui/icons-material/ImageSearchOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import type { ChatConversation } from '../../types/chat';

type ChatDetailsPanelProps = {
  conversation: ChatConversation;
};

const normalizeMediaUrl = (url?: string | null) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
};

function ChatDetailsPanel({ conversation }: ChatDetailsPanelProps) {
  const sharedMedia = conversation.messages.filter(
    (message) => ['IMAGE', 'VIDEO', 'STICKER'].includes(message.type) && Boolean(message.attachmentUrl),
  );

  return (
    <aside className="chat-details" aria-label="Chi tiết cuộc trò chuyện">
      <div className="chat-details-profile">
        <span className="chat-avatar-wrap profile">
          <Avatar src={conversation.avatarUrl || undefined} sx={{ bgcolor: conversation.avatarColor, width: 84, height: 84 }}>
            {conversation.name.charAt(0)}
          </Avatar>
          {conversation.status !== 'offline' && <span className={`chat-status-dot ${conversation.status}`} />}
        </span>
        <h2>{conversation.name}</h2>
        <p>{conversation.activeLabel}</p>
      </div>

      <div className="chat-detail-shortcuts">
        <button type="button">
          <SearchRoundedIcon />
          <span>Tìm kiếm</span>
        </button>
        <button type="button">
          <NotificationsNoneRoundedIcon />
          <span>Tắt TB</span>
        </button>
        <button type="button">
          <ColorLensOutlinedIcon />
          <span>Chủ đề</span>
        </button>
      </div>

      <div className="chat-detail-section">
        <button type="button" className="chat-detail-section-title">
          <span>Tùy chỉnh đoạn chat</span>
          <ExpandMoreRoundedIcon />
        </button>
        <ul>
          <li>
            <ColorLensOutlinedIcon /> Đổi chủ đề
          </li>
          <li>
            <LockOutlinedIcon /> Quyền riêng tư & hỗ trợ
          </li>
          <li>
            <BlockRoundedIcon /> Hạn chế hoặc chặn
          </li>
        </ul>
      </div>

      <div className="chat-detail-section">
        <button type="button" className="chat-detail-section-title">
          <span>File phương tiện đã chia sẻ</span>
          <ExpandMoreRoundedIcon />
        </button>
        <div className="chat-shared-grid">
          {sharedMedia.length > 0 ? (
            sharedMedia.slice(-9).map((message) => {
              const url = normalizeMediaUrl(message.attachmentUrl);

              return (
                <a href={url} target="_blank" rel="noreferrer" key={message.id} style={{ overflow: 'hidden' }}>
                  {message.type === 'IMAGE' || message.type === 'STICKER' ? (
                    <img src={url} alt={message.text || 'File phương tiện đã chia sẻ'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>
                      <ImageSearchOutlinedIcon />
                    </span>
                  )}
                </a>
              );
            })
          ) : (
            <span>
              <ImageSearchOutlinedIcon />
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}

export default ChatDetailsPanel;
