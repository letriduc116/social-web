import { Box, Button, Paper, Typography } from '@mui/material';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import type { PostItem } from '../../types/post';

type Props = {
  posts: PostItem[];
};

const getPostImageUrls = (posts: PostItem[]) => {
  const urls: string[] = [];

  posts.forEach((post) => {
    post.images?.forEach((image) => {
      if (image.urlImage) urls.push(image.urlImage);
    });

    post.sharedPost?.images?.forEach((image) => {
      if (image.urlImage) urls.push(image.urlImage);
    });
  });

  return urls.slice(0, 6);
};

function ProfilePhotosCard({ posts }: Props) {
  const imageUrls = getPostImageUrls(posts);

  return (
    <Paper className="profile-card profile-photos-card" elevation={0}>
      <Box className="profile-card-header">
        <Typography className="profile-card-title">Ảnh</Typography>
        {imageUrls.length > 0 ? <Button className="profile-text-btn">Xem tất cả</Button> : null}
      </Box>

      {imageUrls.length === 0 ? (
        <Box className="profile-photos-empty">
          <PhotoLibraryRoundedIcon />
          <Typography>Chưa có ảnh công khai</Typography>
        </Box>
      ) : (
        <Box className="profile-photo-grid">
          {imageUrls.map((url, index) => (
            <div key={`${url}-${index}`} className="profile-photo-item">
              <img src={url} alt={`profile-photo-${index}`} />
            </div>
          ))}
        </Box>
      )}
    </Paper>
  );
}

export default ProfilePhotosCard;
