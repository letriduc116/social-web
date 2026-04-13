import type { ProfilePost } from '../../types/user';
import PostCard from './PostCard';

type Props = {
  posts: ProfilePost[];
};

function PostList({ posts }: Props) {
  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </>
  );
}

export default PostList;
