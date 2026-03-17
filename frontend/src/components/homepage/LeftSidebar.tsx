const quickLinks = [
  'Trang cá nhân',
  'Bạn bè',
  'Kỷ niệm',
  'Đã lưu',
  'Sự kiện',
  'Marketplace',
];

function LeftSidebar() {
  return (
    <aside className="ducky-sidebar left-sidebar">
      <h3>Lối tắt</h3>
      <ul>
        {quickLinks.map((link) => (
          <li key={link}>
            <button type="button">{link}</button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default LeftSidebar;
