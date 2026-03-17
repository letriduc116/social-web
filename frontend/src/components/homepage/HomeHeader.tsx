const navItems = ['Trang chủ', 'Bạn bè', 'Video', 'Nhóm'];

function HomeHeader() {
  return (
    <header className="ducky-header">
      <div className="ducky-brand" aria-label="Ducky logo">
        <span className="ducky-logo">🦆</span>
        <span className="ducky-title">Ducky</span>
      </div>

      <div className="ducky-search">
        <span className="ducky-search-icon">🔎</span>
        <input type="text" placeholder="Tìm kiếm trên Ducky" />
      </div>

      <nav className="ducky-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <button key={item} type="button">
            {item}
          </button>
        ))}
      </nav>

      <div className="ducky-actions">
        <button type="button">🔔</button>
        <button type="button">💬</button>
        <button type="button">⚙️</button>
      </div>
    </header>
  );
}

export default HomeHeader;
