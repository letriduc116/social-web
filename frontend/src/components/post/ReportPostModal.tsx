import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ReportGmailerrorredOutlinedIcon from '@mui/icons-material/ReportGmailerrorredOutlined';
import type { PostItem } from '../../types/post';

type ReportReason = {
  id: string;
  title: string;
  description: string;
};

type ReportPostModalProps = {
  open: boolean;
  post: PostItem | null;
  onClose: () => void;
  onSubmit?: (reasonId: string) => Promise<void> | void;
};

const REPORT_REASONS: ReportReason[] = [
  {
    id: 'spam_or_scam',
    title: 'Spam, lừa đảo hoặc gian lận',
    description: 'Nội dung có dấu hiệu quảng cáo rác, link lừa đảo hoặc gây hiểu nhầm.',
  },
  {
    id: 'hate_or_harassment',
    title: 'Quấy rối, thù ghét hoặc gây phiền toái',
    description: 'Nội dung công kích, xúc phạm hoặc làm phiền người khác.',
  },
  {
    id: 'violence',
    title: 'Bạo lực hoặc nội dung không phù hợp',
    description: 'Nội dung có yếu tố bạo lực, phản cảm hoặc không phù hợp cộng đồng.',
  },
  {
    id: 'intellectual_property',
    title: 'Quyền sở hữu trí tuệ',
    description: 'Bài viết có thể vi phạm bản quyền, thương hiệu hoặc nội dung của người khác.',
  },
];

function ReportPostModal({ open, post, onClose, onSubmit }: ReportPostModalProps) {
  const [selectedReasonId, setSelectedReasonId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedReasonId('');
      setSubmitting(false);
      setSubmitted(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedReasonId || submitting) return;

    try {
      setSubmitting(true);
      await onSubmit?.(selectedReasonId);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
      <Box sx={{ position: 'relative', px: 2.5, py: 1.8, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 22, fontWeight: 900 }}>Báo cáo</Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 10, bgcolor: '#e4e6eb', '&:hover': { bgcolor: '#d8dadf' } }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <DialogContent sx={{ px: 2.5, py: 2 }}>
        {submitted ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 62, color: '#1877f2', mb: 1.2 }} />
            <Typography sx={{ fontSize: 21, fontWeight: 900 }}>Cảm ơn bạn đã báo cáo</Typography>
            <Typography sx={{ color: '#65676b', mt: 1, maxWidth: 420, mx: 'auto' }}>
              Báo cáo của bạn đã được ghi nhận trên giao diện. Khi có API kiểm duyệt, bạn có thể gửi lý do này về backend.
            </Typography>
            <Button variant="contained" fullWidth sx={{ mt: 3, borderRadius: '10px', fontWeight: 800 }} onClick={onClose}>
              Xong
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, mb: 2 }}>
              <ReportGmailerrorredOutlinedIcon sx={{ color: '#65676b', mt: 0.2 }} />
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: 18 }}>Tại sao bạn báo cáo bài viết này?</Typography>
                <Typography sx={{ color: '#65676b', lineHeight: 1.35 }}>
                  {post?.user?.fullName || post?.user?.userName
                    ? `Báo cáo bài viết của ${post.user.fullName || post.user.userName}.`
                    : 'Chọn vấn đề phù hợp nhất với nội dung bạn nhìn thấy.'}
                </Typography>
              </Box>
            </Box>

            <Box>
              {REPORT_REASONS.map((reason) => {
                const active = selectedReasonId === reason.id;
                return (
                  <button
                    type="button"
                    key={reason.id}
                    onClick={() => setSelectedReasonId(reason.id)}
                    style={{
                      width: '100%',
                      border: active ? '2px solid #1877f2' : '1px solid transparent',
                      background: active ? '#e7f3ff' : '#fff',
                      borderRadius: 12,
                      padding: '12px 10px',
                      marginBottom: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <Box sx={{ pr: 1 }}>
                      <Typography sx={{ fontWeight: 850 }}>{reason.title}</Typography>
                      <Typography variant="body2" sx={{ color: '#65676b', mt: 0.2 }}>
                        {reason.description}
                      </Typography>
                    </Box>
                    <ChevronRightOutlinedIcon sx={{ color: '#65676b', flexShrink: 0 }} />
                  </button>
                );
              })}
            </Box>

            <Button
              fullWidth
              variant="contained"
              disabled={!selectedReasonId || submitting}
              onClick={handleSubmit}
              sx={{ mt: 2, borderRadius: '10px', py: 1.1, fontWeight: 900 }}
            >
              {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ReportPostModal;
