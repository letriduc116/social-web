import HomeHeader from '../components/homepage/HomeHeader';
import LeftSidebar from '../components/homepage/LeftSidebar';
import RightSidebar from '../components/homepage/RightSidebar';
import '../styles/homepage.css';

const posts = [
  {
    author: 'Ducky Team',
    time: '2 giờ trước',
    content:
      'Chào mừng bạn đến với Ducky! Kết nối với bạn bè, chia sẻ khoảnh khắc và lan tỏa năng lượng tích cực 🦆',
  },
  {
    author: 'Vịt Vàng',
    time: '5 giờ trước',
    content: 'Hôm nay trời đẹp quá, ai đi dạo hồ cùng mình không?',
  },
];

function Homepage() {
  return (
    <div className="ducky-page">
      <HomeHeader />

      <main className="ducky-layout">
        <LeftSidebar />

        <section className="ducky-feed" aria-label="News feed">
          <div className="ducky-composer">
            <span className="avatar">🦆</span>
            <input type="text" placeholder="Bạn đang nghĩ gì vậy?" />
          </div>

          {posts.map((post) => (
            <article className="ducky-post" key={`${post.author}-${post.time}`}>
              <div className="post-header">
                <span className="avatar small">🦆</span>
                <div>
                  <h4>{post.author}</h4>
                  <span>{post.time}</span>
                </div>
              </div>
              <p>{post.content}</p>
              <div className="post-actions">
                <button type="button">Thích</button>
                <button type="button">Bình luận</button>
                <button type="button">Chia sẻ</button>
              </div>
            </article>
          ))}
        </section>

        <RightSidebar />
      </main>
    </div>
  );
}

export default Homepage;
