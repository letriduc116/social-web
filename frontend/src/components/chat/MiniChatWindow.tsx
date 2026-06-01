import { Avatar, Tooltip } from '@mui/material';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import GifBoxRoundedIcon from '@mui/icons-material/GifBoxRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import MicNoneRoundedIcon from '@mui/icons-material/MicNoneRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import { useEffect, useRef, useState, type CSSProperties, type ChangeEvent, type FormEvent } from 'react';
import ChatMediaPicker, { type ChatPickerMode } from './ChatMediaPicker';
import type { GiphyMedia } from '../../services/giphyService';
import type { ChatAttachmentMessageType, ChatConversation, ChatMessage } from '../../types/chat';

const normalizeMediaUrl = (url?: string | null) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
};

type MiniChatWindowProps = {
  conversation: ChatConversation;
  draftMessage: string;
  isMinimized: boolean;
  positionIndex: number;
  reserveBubbleColumn?: boolean;
  onDraftMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onSendQuickText: (text: string) => void;
  onSendAttachment: (file: File, preferredType?: ChatAttachmentMessageType) => void;
  onSendSticker: (sticker: string, attachmentUrl?: string) => void;
  onRestore: () => void;
  onMinimize: () => void;
  onClose: () => void;
};

function renderMiniMessageContent(message: ChatMessage) {
  const url = normalizeMediaUrl(message.attachmentUrl);

  if (message.type === 'IMAGE' && url) {
    return <img src={url} alt={message.text || 'Ảnh đã gửi'} className="mini-chat-message-image" style={{ maxWidth: 180, borderRadius: 12, display: 'block' }} />;
  }

  if (message.type === 'VIDEO' && url) {
    return <video src={url} controls className="mini-chat-message-video" style={{ maxWidth: 180, borderRadius: 12, display: 'block' }} />;
  }

  if (message.type === 'AUDIO' && url) {
    return <audio src={url} controls className="mini-chat-message-audio" style={{ width: 180, maxWidth: '100%' }} />;
  }

  if (message.type === 'FILE' && url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mini-chat-message-file">
        📎 {message.text || 'Mở tệp'}
      </a>
    );
  }

  if (message.type === 'STICKER' && url) {
    return <img src={url} alt={message.text || 'Sticker'} className="mini-chat-message-sticker" style={{ maxWidth: 150, maxHeight: 150, objectFit: 'contain', display: 'block' }} />;
  }

  if (message.type === 'STICKER') {
    return <span className="mini-chat-message-sticker-emoji">{message.text || '👍'}</span>;
  }

  return message.text;
}

function MiniChatWindow({
  conversation,
  draftMessage,
  isMinimized,
  positionIndex,
  reserveBubbleColumn = false,
  onDraftMessageChange,
  onSendMessage,
  onSendQuickText,
  onSendAttachment,
  onSendSticker,
  onRestore,
  onMinimize,
  onClose,
}: MiniChatWindowProps) {
  const messageAreaRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [pickerState, setPickerState] = useState<{ conversationId: string; mode: ChatPickerMode | null }>({
    conversationId: '',
    mode: null,
  });
  const [isRecording, setIsRecording] = useState(false);
  const pickerMode = !isMinimized && pickerState.conversationId === conversation.id ? pickerState.mode : null;

  useEffect(() => {
    const messageArea = messageAreaRef.current;
    if (!messageArea) return;
    messageArea.scrollTop = messageArea.scrollHeight;
  }, [conversation.id, conversation.messages.length, conversation.typing, isMinimized]);

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

  const toggleRecording = () => {
    if (isRecording) {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') recorder.stop();
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

  if (isMinimized) {
    return (
      <div className="mini-chat-launcher" style={{ '--mini-chat-index': positionIndex } as CSSProperties}>
        <Tooltip title={`Mở lại chat với ${conversation.name}`}>
          <button type="button" className="mini-chat-avatar-button" onClick={onRestore}>
            <Avatar src={conversation.avatarUrl || undefined} sx={{ bgcolor: conversation.avatarColor, width: 50, height: 50 }}>
              {conversation.name.charAt(0)}
            </Avatar>
            {conversation.status !== 'offline' && <span className={`mini-chat-status-dot ${conversation.status}`} />}
          </button>
        </Tooltip>
        <Tooltip title="Đóng">
          <button type="button" className="mini-chat-close-launcher" onClick={onClose} aria-label="Đóng đoạn chat">
            <CloseRoundedIcon fontSize="small" />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <section
      className="mini-chat-window"
      style={
        {
          '--mini-chat-slot': positionIndex,
          '--mini-chat-bubble-offset': reserveBubbleColumn ? '72px' : '0px',
        } as CSSProperties
      }
      aria-label={`Đoạn chat thu nhỏ với ${conversation.name}`}
    >
      <header className="mini-chat-header">
        <button type="button" className="mini-chat-title" onClick={onRestore}>
          <span className="mini-chat-avatar-wrap">
            <Avatar src={conversation.avatarUrl || undefined} sx={{ bgcolor: conversation.avatarColor, width: 34, height: 34 }}>
              {conversation.name.charAt(0)}
            </Avatar>
            {conversation.status !== 'offline' && <span className={`mini-chat-status-dot ${conversation.status}`} />}
          </span>
          <span>
            <strong>{conversation.name}</strong>
            <small>{conversation.activeLabel}</small>
          </span>
        </button>

        <div className="mini-chat-actions">
          <Tooltip title="Tùy chọn">
            <button type="button" aria-label="Tùy chọn đoạn chat">
              <MoreHorizRoundedIcon />
            </button>
          </Tooltip>
          <Tooltip title="Gọi thoại">
            <button type="button" aria-label="Gọi thoại">
              <CallRoundedIcon />
            </button>
          </Tooltip>
          <Tooltip title="Gọi video">
            <button type="button" aria-label="Gọi video">
              <VideocamRoundedIcon />
            </button>
          </Tooltip>
          <Tooltip title="Thu nhỏ">
            <button type="button" onClick={onMinimize} aria-label="Thu nhỏ đoạn chat">
              <span className="mini-chat-minimize-line" />
            </button>
          </Tooltip>
          <Tooltip title="Đóng">
            <button type="button" onClick={onClose} aria-label="Đóng đoạn chat">
              <CloseRoundedIcon />
            </button>
          </Tooltip>
        </div>
      </header>

      <div className="mini-chat-messages" ref={messageAreaRef}>
        <div className="mini-chat-profile">
          <Avatar src={conversation.avatarUrl || undefined} sx={{ bgcolor: conversation.avatarColor, width: 56, height: 56 }}>
            {conversation.name.charAt(0)}
          </Avatar>
          <strong>{conversation.name}</strong>
          <span>{conversation.activeLabel}</span>
        </div>

        {conversation.messages.map((message) => {
          const mine = message.mine || message.sender === 'me';

          return (
            <div className={`mini-chat-message-row ${mine ? 'me' : 'them'}`} key={message.id}>
              {!mine && (
                <Avatar src={conversation.avatarUrl || undefined} sx={{ bgcolor: conversation.avatarColor, width: 28, height: 28 }}>
                  {conversation.name.charAt(0)}
                </Avatar>
              )}

              <div className="mini-chat-bubble-group">
                <div className={`mini-chat-bubble mini-chat-bubble-${message.type.toLowerCase()}`}>{renderMiniMessageContent(message)}</div>
                <span>{message.time}</span>
              </div>
            </div>
          );
        })}

        {conversation.typing && (
          <div className="mini-chat-message-row them mini-chat-typing-row">
            <Avatar src={conversation.avatarUrl || undefined} sx={{ bgcolor: conversation.avatarColor, width: 28, height: 28 }}>
              {conversation.name.charAt(0)}
            </Avatar>
            <div className="mini-chat-typing-bubble" aria-label="Đang nhập">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      <form className="mini-chat-composer" onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <input ref={imageInputRef} hidden type="file" accept="image/*" multiple onChange={(event) => handleFileChange(event, 'IMAGE')} />
        <input ref={videoInputRef} hidden type="file" accept="video/*" multiple onChange={(event) => handleFileChange(event, 'VIDEO')} />
        <input ref={fileInputRef} hidden type="file" multiple onChange={(event) => handleFileChange(event, 'FILE')} />

        <button type="button" aria-label="Gửi ảnh" onClick={() => imageInputRef.current?.click()}>
          <ImageOutlinedIcon />
        </button>
        <button type="button" aria-label="Gửi video" onClick={() => videoInputRef.current?.click()}>
          <VideocamRoundedIcon />
        </button>
        <button type="button" aria-label="Gửi file" onClick={() => fileInputRef.current?.click()}>
          <AttachFileRoundedIcon />
        </button>
        <button type="button" aria-label="Gửi ghi âm" onClick={toggleRecording}>
          {isRecording ? <StopCircleOutlinedIcon color="error" /> : <MicNoneRoundedIcon />}
        </button>
        <label>
          <input
            type="text"
            placeholder={isRecording ? 'Đang ghi âm...' : 'Aa'}
            value={draftMessage}
            onChange={(event) => onDraftMessageChange(event.target.value)}
            disabled={isRecording}
          />
          <button type="button" aria-label="Chọn biểu tượng" onClick={() => togglePicker('emoji')}>
            <EmojiEmotionsOutlinedIcon />
          </button>
        </label>
        <button type="button" aria-label="GIF hoặc sticker" onClick={() => togglePicker('gif')}>
          <GifBoxRoundedIcon />
        </button>
        <button type="submit" aria-label={draftMessage.trim() ? 'Gửi tin nhắn' : 'Gửi lượt thích'} disabled={isRecording}>
          {draftMessage.trim() ? <SendRoundedIcon /> : <ThumbUpAltRoundedIcon />}
        </button>

        {pickerMode && (
          <ChatMediaPicker
            mode={pickerMode}
            compact
            onModeChange={handlePickerModeChange}
            onSelectEmoji={appendEmoji}
            onSelectGif={sendGiphySticker}
            onSelectSticker={sendGiphySticker}
          />
        )}
      </form>

      <button type="button" className="mini-chat-scroll-btn" aria-label="Cuộn xuống cuối" onClick={onRestore}>
        <KeyboardArrowUpRoundedIcon />
      </button>
    </section>
  );
}

export default MiniChatWindow;
