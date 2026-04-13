import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';

type PrivacyOption = 'public' | 'friends' | 'only_me';

type CreatePostModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: { content: string; files: File[]; privacy: PrivacyOption }) => Promise<void> | void;
  userName?: string;
  userAvatarText?: string;
};

const PRIVACY_OPTIONS: Record<
  PrivacyOption,
  {
    label: string;
    icon: ReactNode;
  }
> = {
  public: {
    label: 'Mọi người',
    icon: <PublicOutlinedIcon fontSize="small" />,
  },
  friends: {
    label: 'Bạn bè',
    icon: <PeopleAltOutlinedIcon fontSize="small" />,
  },
  only_me: {
    label: 'Chỉ mình tôi',
    icon: <LockOutlinedIcon fontSize="small" />,
  },
};

function CreatePostModal({
  open,
  onClose,
  onSubmit,
  userName = 'Trí Đức',
  userAvatarText = 'T',
}: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [privacy, setPrivacy] = useState<PrivacyOption>('public');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      setContent('');
      setFiles([]);
      setPrivacy('public');
      setSubmitting(false);
    }
  }, [open]);

  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [files],
  );

  useEffect(() => {
    return () => {
      previews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previews]);

  const handlePickImages = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    setFiles((prev) => [...prev, ...selectedFiles]);
    event.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handlePrivacyChange = (event: SelectChangeEvent<PrivacyOption>) => {
    setPrivacy(event.target.value as PrivacyOption);
  };

  const canSubmit = content.trim().length > 0 || files.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);
      await onSubmit?.({
        content: content.trim(),
        files,
        privacy,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ className: 'fb-create-post-modal' }}>
      <Box className="fb-create-post-header">
        <Typography className="fb-create-post-title">Tạo bài viết</Typography>

        <IconButton onClick={onClose} className="fb-create-post-close-btn">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <DialogContent className="fb-create-post-content">
        <Box className="fb-create-post-user">
          <Avatar className="fb-create-post-avatar">{userAvatarText}</Avatar>

          <Box className="fb-create-post-user-meta">
            <Typography className="fb-create-post-user-name">{userName}</Typography>

            <Select
              value={privacy}
              onChange={handlePrivacyChange}
              size="small"
              className="fb-create-post-privacy-select"
              IconComponent={KeyboardArrowDownRoundedIcon}
              renderValue={(value) => (
                <Box className="fb-create-post-privacy-value">
                  {PRIVACY_OPTIONS[value].icon}
                  <span>{PRIVACY_OPTIONS[value].label}</span>
                </Box>
              )}
              MenuProps={{
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
                slotProps: {
                  paper: {
                    sx: {
                      mt: 0.5,
                      ml: 0.1,
                      borderRadius: '12px',
                      minWidth: 286,
                      overflow: 'hidden',
                      boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
                    },
                  },
                },
              }}
            >
              <MenuItem value="public">
                <Box className="fb-create-post-privacy-option">
                  <PublicOutlinedIcon fontSize="small" />
                  <Box>
                    <Typography fontWeight={600}>Mọi người</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ai cũng có thể xem bài viết này
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>

              <MenuItem value="friends">
                <Box className="fb-create-post-privacy-option">
                  <PeopleAltOutlinedIcon fontSize="small" />
                  <Box>
                    <Typography fontWeight={600}>Bạn bè</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chỉ bạn bè của bạn có thể xem
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>

              <MenuItem value="only_me">
                <Box className="fb-create-post-privacy-option">
                  <LockOutlinedIcon fontSize="small" />
                  <Box>
                    <Typography fontWeight={600}>Chỉ mình tôi</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chỉ bạn có thể xem bài viết này
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            </Select>
          </Box>
        </Box>

        <textarea
          className="fb-create-post-textarea"
          placeholder={`${userName} ơi, bạn đang nghĩ gì thế?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
        />

        <input ref={inputRef} type="file" hidden accept="image/*" multiple onChange={handleFileChange} />

        {previews.length > 0 ? (
          <Box className={`fb-create-post-preview-grid ${previews.length === 1 ? 'single' : ''}`}>
            {previews.map((item, index) => (
              <Box key={`${item.file.name}-${index}`} className="fb-create-post-preview-item">
                <img src={item.url} alt={item.file.name} />

                <IconButton className="fb-create-post-remove-image" onClick={() => handleRemoveImage(index)}>
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        ) : (
          <Box className="fb-create-post-empty-upload" onClick={handlePickImages}>
            <Box className="fb-create-post-empty-upload-inner">
              <AddPhotoAlternateOutlinedIcon />
              <Typography fontWeight={700}>Thêm ảnh/video</Typography>
              <Typography variant="body2" color="text.secondary">
                Bấm để chọn ảnh từ máy tính
              </Typography>
            </Box>
          </Box>
        )}

        <Box className="fb-create-post-tools">
          <Typography fontWeight={700}>Thêm vào bài viết của bạn</Typography>

          <Box className="fb-create-post-tool-actions">
            <IconButton onClick={handlePickImages}>
              <ImageOutlinedIcon sx={{ color: '#45bd62' }} />
            </IconButton>

            <IconButton>
              <EmojiEmotionsOutlinedIcon sx={{ color: '#f7b928' }} />
            </IconButton>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          className="fb-create-post-submit"
          disabled={!canSubmit || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Đang đăng...' : 'Đăng'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default CreatePostModal;
