import { Box, Button, Typography } from '@mui/material';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';

type Props = {
  isOwner: boolean;
  onCreatePost?: () => void;
};

function ProfileEmptyState({ isOwner, onCreatePost }: Props) {
  return (
    <Box className="profile-empty-posts">
      <ArticleOutlinedIcon />
      <Typography className="profile-empty-title">Chưa có bài viết nào</Typography>
      <Typography className="profile-empty-desc">
        {isOwner ? 'Hãy chia sẻ khoảnh khắc đầu tiên lên trang cá nhân của bạn.' : 'Người này chưa có bài viết công khai.'}
      </Typography>
      {isOwner ? (
        <Button variant="contained" className="profile-primary-btn" onClick={onCreatePost}>
          Tạo bài viết
        </Button>
      ) : null}
    </Box>
  );
}

export default ProfileEmptyState;
