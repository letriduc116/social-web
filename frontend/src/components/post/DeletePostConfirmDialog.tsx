import { Box, Button, Dialog, DialogActions, DialogContent, Divider, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

type DeletePostConfirmDialogProps = {
  open: boolean;
  deleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function DeletePostConfirmDialog({ open, deleting, onClose, onConfirm }: DeletePostConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={deleting ? undefined : onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '16px' } }}>
      <Box sx={{ position: 'relative', px: 2.5, py: 1.8, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 22, fontWeight: 900 }}>Chuyển vào thùng rác?</Typography>
        <IconButton
          onClick={onClose}
          disabled={deleting}
          sx={{ position: 'absolute', right: 12, top: 10, bgcolor: '#e4e6eb', '&:hover': { bgcolor: '#d8dadf' } }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <DialogContent sx={{ px: 2.5, py: 2.2 }}>
        <Box sx={{ display: 'flex', gap: 1.4, alignItems: 'flex-start' }}>
          <Box sx={{ bgcolor: '#f0f2f5', borderRadius: '50%', width: 42, height: 42, display: 'grid', placeItems: 'center' }}>
            <DeleteOutlineOutlinedIcon />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 850 }}>Bạn có chắc muốn xoá bài viết này không?</Typography>
            <Typography sx={{ color: '#65676b', mt: 0.5, lineHeight: 1.35 }}>
              Bài viết sẽ bị xoá khỏi trang cá nhân và bảng tin. Thao tác này không thể hoàn tác trên giao diện hiện tại.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2, pt: 0 }}>
        <Button onClick={onClose} disabled={deleting} sx={{ borderRadius: '8px', fontWeight: 800 }}>
          Huỷ
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={deleting}
          onClick={onConfirm}
          sx={{ borderRadius: '8px', fontWeight: 900, minWidth: 112 }}
        >
          {deleting ? 'Đang xoá...' : 'Xoá'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeletePostConfirmDialog;
