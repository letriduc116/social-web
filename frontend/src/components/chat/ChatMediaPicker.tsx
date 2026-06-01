import EmojiPicker, { EmojiStyle, Theme, type EmojiClickData } from 'emoji-picker-react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useEffect, useMemo, useState } from 'react';
import { fetchGiphyMedia, getGiphyApiKey, type GiphyMedia, type GiphyMediaKind } from '../../services/giphyService';

export type ChatPickerMode = 'emoji' | 'gif' | 'sticker';

type ChatMediaPickerProps = {
  mode: ChatPickerMode;
  compact?: boolean;
  onModeChange: (mode: ChatPickerMode) => void;
  onSelectEmoji: (emoji: string) => void;
  onSelectGif: (media: GiphyMedia) => void;
  onSelectSticker: (media: GiphyMedia) => void;
};

const TABS: Array<{ mode: ChatPickerMode; label: string }> = [
  { mode: 'emoji', label: 'Emoji' },
  { mode: 'sticker', label: 'Sticker' },
  { mode: 'gif', label: 'GIF' },
];

function ChatMediaPicker({
  mode,
  compact = false,
  onModeChange,
  onSelectEmoji,
  onSelectGif,
  onSelectSticker,
}: ChatMediaPickerProps) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<GiphyMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const mediaKind: GiphyMediaKind | null = useMemo(() => {
    if (mode === 'gif') return 'gif';
    if (mode === 'sticker') return 'sticker';
    return null;
  }, [mode]);

  const missingGiphyApiKey = Boolean(mediaKind && !getGiphyApiKey());
  const visibleErrorMessage = missingGiphyApiKey
    ? 'Chưa cấu hình VITE_GIPHY_API_KEY để tải GIF/sticker động.'
    : errorMessage;

  useEffect(() => {
    if (!mediaKind || missingGiphyApiKey) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setErrorMessage('');

      fetchGiphyMedia(mediaKind, query)
        .then((data) => {
          if (!cancelled) setItems(data);
        })
        .catch((error) => {
          if (!cancelled) {
            console.error(error);
            setItems([]);
            setErrorMessage(error instanceof Error ? error.message : 'Không tải được dữ liệu');
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [mediaKind, missingGiphyApiKey, query]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onSelectEmoji(emojiData.emoji);
  };

  const handleMediaClick = (item: GiphyMedia) => {
    if (mode === 'gif') {
      onSelectGif(item);
      return;
    }

    onSelectSticker(item);
  };

  const handleModeClick = (nextMode: ChatPickerMode) => {
    if (nextMode !== mode) {
      setQuery('');
      setErrorMessage('');
    }

    onModeChange(nextMode);
  };

  return (
    <div className={`chat-rich-picker ${compact ? 'compact' : ''}`} role="dialog" aria-label="Chọn emoji, sticker hoặc GIF">
      <div className="chat-rich-picker-tabs">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab.mode}
            className={mode === tab.mode ? 'active' : ''}
            onClick={() => handleModeClick(tab.mode)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === 'emoji' ? (
        <div className="chat-rich-picker-emoji">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            emojiStyle={EmojiStyle.FACEBOOK}
            theme={Theme.LIGHT}
            lazyLoadEmojis
            width="100%"
            height={compact ? 300 : 360}
            searchPlaceholder="Tìm kiếm biểu tượng cảm xúc"
            previewConfig={{ showPreview: false }}
          />
        </div>
      ) : (
        <div className="chat-rich-picker-media">
          <label className="chat-rich-picker-search">
            <SearchRoundedIcon fontSize="small" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={mode === 'gif' ? 'Tìm GIF' : 'Tìm sticker'}
            />
          </label>

          {visibleErrorMessage && <p className="chat-rich-picker-message">{visibleErrorMessage}</p>}
          {loading && <p className="chat-rich-picker-message">Đang tải...</p>}

          {!loading && !visibleErrorMessage && (
            <div className="chat-rich-picker-grid">
              {items.length > 0 ? (
                items.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className="chat-rich-picker-media-item"
                    title={item.title}
                    onClick={() => handleMediaClick(item)}
                  >
                    <img src={item.previewUrl} alt={item.title} loading="lazy" />
                  </button>
                ))
              ) : (
                <p className="chat-rich-picker-message full">Không có kết quả phù hợp.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatMediaPicker;
