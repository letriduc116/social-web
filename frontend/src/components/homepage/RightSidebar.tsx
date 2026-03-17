const contacts = ['Vịt Vàng', 'Vịt Trắng', 'Ngỗng Hồng', 'Thiên Nga Xám'];

function RightSidebar() {
  return (
    <aside className="ducky-sidebar right-sidebar">
      <h3>Người liên hệ</h3>
      <ul>
        {contacts.map((contact) => (
          <li key={contact}>
            <span className="status-dot" />
            {contact}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default RightSidebar;
