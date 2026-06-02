import { Avatar, Tooltip } from '@mui/material';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import GifBoxOutlinedIcon from '@mui/icons-material/GifBoxOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MicNoneRoundedIcon from '@mui/icons-material/MicNoneRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import ChatMediaPicker, { type ChatPickerMode } from './ChatMediaPicker';
import type { ChatAttachmentMessageType, ChatConversation, ChatMessage } from '../../types/chat';
import type { GiphyMedia } from '../../services/giphyService';

const mediaStyle = {
  maxWidth: 260,
  borderRadius: 14,
  display: 'block',
} as const;

const stickerMediaStyle = {
  maxWidth: 220,
  maxHeight: 220,
  objectFit: 'contain',
  display: 'block',
} as const;

const normalizeMediaUrl = (url?: string | null) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
};

type ChatWindowProps = {
  conversation: ChatConversation;
  draftMessage: string;
  sending?: boolean;
  onDraftMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onSendQuickText: (text: string) => void;
  onSendAttachment: (file: File, preferredType?: ChatAttachmentMessageType) => void;
  onSendSticker: (sticker: string, attachmentUrl?: string) => void;
  onStartCall?: (video: boolean) => void;
};

function renderMessageContent(message: ChatMessage) {
  const url = normalizeMediaUrl(message.attachmentUrl);

  if (message.type === 'IMAGE' && url) {
    return <img src={url} alt={message.text || 'Ảnh đã gửi'} className="chat-message-image" style={mediaStyle} />;
  }

  if (message.type === 'VIDEO' && url) {
    return <video src={url} controls className="chat-message-video" style={mediaStyle} />;
  }

  if (message.type === 'AUDIO' && url) {
    return <audio src={url} controls className="chat-message-audio" style={{ width: 240, maxWidth: '100%' }} />;
  }

  if (message.type === 'FILE' && url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="chat-message-file">
        📎 {message.text || 'Mở tệp đính kèm'}
      </a>
    );
  }

  if (message.type === 'STICKER' && url) {
    return <img src={url} alt={message.text || 'Sticker'} className="chat-message-sticker" style={stickerMediaStyle} />;
  }

  if (message.type === 'STICKER') {
    return <span className="chat-message-sticker-emoji">{message.text || '👍'}</span>;
  }

  return message.text;
}

function ChatWindow({
  conversation,
  draftMessage,
  sending = false,
  onDraftMessageChange,
  onSendMessage,
  onSendQuickText,
  onSendAttachment,
  onSendSticker,
  onStartCall,
}: ChatWindowProps) {
  const messageAreaRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [pickerState, setPickerState] = useState<{ conversationId: string; mode: ChatPickerMode | null }>({
    conversationId: '',
    mode: null,
  });
  const pickerMode = pickerState.conversationId === conversation.id ? pickerState.mode : null;

  useEffect(() => {
    const messageArea = messageAreaRef.current;
    if (!messageArea) return;
    messageArea.scrollTop = messageArea.scrollHeight;
  }, [conversation.id, conversation.messages.length, conversation.typing]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (draftMessage.trim()) {
      onSendMessage();
      return;
    }

    onSendQuickText('👍');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, preferredType?: ChatAttachmentMessageType) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    files.forEach((file) => onSendAttachment(file, preferredType));
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      alert('Trình duyệt chưa hỗ trợ ghi âm.');
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunksRef.current = [];

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
      onSendAttachment(file, 'AUDIO');
      audioChunksRef.current = [];
      setIsRecording(false);
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    void startRecording().catch((error) => {
      console.error('Không thể ghi âm:', error);
      setIsRecording(false);
    });
  };

  const appendEmoji = (emoji: string) => {
    onDraftMessageChange(`${draftMessage}${emoji}`);
  };

  const closePicker = () => {
    setPickerState({ conversationId: conversation.id, mode: null });
  };

  const sendGiphySticker = (media: GiphyMedia) => {
    onSendSticker(media.title || 'Sticker', media.url);
    closePicker();
  };

  const handlePickerModeChange = (mode: ChatPickerMode) => {
    setPickerState({ conversationId: conversation.id, mode });
  };

  const togglePicker = (mode: ChatPickerMode) => {
    setPickerState((current) =>
      current.conversationId === conversation.id && current.mode === mode
        ? { conversationId: conversation.id, mode: null }
        : { conversationId: conversation.id, mode },
    );
  };

  return (
    <section className="chat-window" aria-label={`Nhắn tin với ${conversation.name}`}>
      <header className="chat-window-header">
        <div className="chat-peer-summary">
          <span className="chat-avatar-wrap large">
            <Avatar src={conversation.avatarUrl || undefined} sx={{ bgcolor: conversation.avatarColor, width: 44, height: 44 }}>
              {conversation.name.charAt(0)}
            </Avatar>
            {conversation.status !== 'offline' && <span className={`chat-status-dot ${conversation.status}`} />}
          </span>
          <div>
            <h2>{conversation.name}</h2>
            <p>{conversation.activeLabel}</p>
          </div>
        </div>

        <div className="chat-window-actions" aria-label="Tùy chọn cuộc gọi và thông tin">
          <button type="button" aria-label="Gọi thoại" onClick={() => onStartCall?.(false)}>
            <CallRoundedIcon />
          </button>
          <button type="button" aria-label="Gọi video" onClick={() => onStartCall?.(true)}>
            <VideocamRoundedIcon />
          </button>
          <button type="button" aria-label="Thông tin hội thoại">
            <InfoOutlinedIcon />
          </button>
        </div>
      </header>

      <div className="chat-message-area" ref={messageAreaRef}>
        <div className="chat-intro-card">
          <Avatar src={conversation.avatarUrl || undefined} sx={{ bgcolor: conversation.avatarColor, width: 72, height: 72 }}>
            {conversation.name.charAt(0)}
          </Avatar>
          <h3>{conversation.name}</h3>
          <p>{conversation.activeLabel}. Các tin nhắn và cuộc gọi được hiển thị tại đây.</p>
        </div>

        <div className="chat-date-divider">Hôm nay</div>

        {conversation.messages.map((message) => {
          const mine = message.mine || message.sender === 'me';

          return (
            <div className={`chat-message-row ${mine ? 'me' : 'them'}`} key={message.id}>
              {!mine && (
                <Avatar src={conversation.avatarUrl || undefined} sx={{ bgcolor: conversation.avatarColor, width: 30, height: 30 }}>
                  {conversation.name.charAt(0)}
                </Avatar>
              )}
              <div className="chat-bubble-group">
                <div className={`chat-bubble chat-bubble-${message.type.toLowerCase()}`}>{renderMessageContent(message)}</div>
                <span className="chat-message-meta">
                  {message.time}
                  {message.status ? ` · ${message.status === 'seen' ? 'Đã xem' : 'Đã gửi'}` : ''}
                </span>
              </div>
            </div>
          );
        })}

        {conversation.typing && (
          <div className="chat-message-row them typing-row">
            <Avatar src={conversation.avatarUrl || undefined} sx={{ bgcolor: conversation.avatarColor, width: 30, height: 30 }}>
              {conversation.name.charAt(0)}
            </Avatar>
            <div className="typing-bubble" aria-label="Đang nhập">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      <form className="chat-composer" onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <input ref={imageInputRef} hidden type="file" accept="image/*" multiple onChange={(event) => handleFileChange(event, 'IMAGE')} />
        <input ref={videoInputRef} hidden type="file" accept="video/*" multiple onChange={(event) => handleFileChange(event, 'VIDEO')} />
        <input ref={fileInputRef} hidden type="file" multiple onChange={(event) => handleFileChange(event, 'FILE')} />

        <Tooltip title="Thêm">
          <button type="button" aria-label="Mở thêm hành động" onClick={() => fileInputRef.current?.click()} disabled={sending}>
            <AddCircleOutlineRoundedIcon />
          </button>
        </Tooltip>
        <Tooltip title="Gửi ảnh">
          <button type="button" aria-label="Gửi ảnh" onClick={() => imageInputRef.current?.click()} disabled={sending}>
            <ImageOutlinedIcon />
          </button>
        </Tooltip>
        <Tooltip title="Gửi video">
          <button type="button" aria-label="Gửi video" onClick={() => videoInputRef.current?.click()} disabled={sending}>
            <VideocamRoundedIcon />
          </button>
        </Tooltip>
        <Tooltip title="Gửi file">
          <button type="button" aria-label="Gửi file" onClick={() => fileInputRef.current?.click()} disabled={sending}>
            <AttachFileRoundedIcon />
          </button>
        </Tooltip>
        <Tooltip title={isRecording ? 'Dừng ghi âm' : 'Gửi ghi âm'}>
          <button type="button" aria-label="Gửi ghi âm" onClick={toggleRecording} disabled={sending}>
            {isRecording ? <StopCircleOutlinedIcon color="error" /> : <MicNoneRoundedIcon />}
          </button>
        </Tooltip>

        <label className="chat-composer-input">
          <input
            type="text"
            placeholder={isRecording ? 'Đang ghi âm...' : 'Aa'}
            value={draftMessage}
            onChange={(event) => onDraftMessageChange(event.target.value)}
            disabled={sending || isRecording}
          />
          <button type="button" aria-label="Chọn biểu tượng" onClick={() => togglePicker('emoji')}>
            <EmojiEmotionsOutlinedIcon />
          </button>
          <button type="button" aria-label="Chọn GIF hoặc sticker" onClick={() => togglePicker('gif')}>
            <GifBoxOutlinedIcon />
          </button>
        </label>

        {pickerMode && (
          <ChatMediaPicker
            mode={pickerMode}
            onModeChange={handlePickerModeChange}
            onSelectEmoji={appendEmoji}
            onSelectGif={sendGiphySticker}
            onSelectSticker={sendGiphySticker}
          />
        )}

        <button type="submit" className="chat-send-btn" aria-label={draftMessage.trim() ? 'Gửi tin nhắn' : 'Gửi lượt thích'} disabled={sending || isRecording}>
          {draftMessage.trim() ? <SendRoundedIcon /> : <ThumbUpAltRoundedIcon />}
        </button>
      </form>
    </section>
  );
}

export default ChatWindow;
