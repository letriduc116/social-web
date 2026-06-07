type AdminProgressBarProps = {
  label: string;
  value: number;
  total: number;
  note?: string;
};

function AdminProgressBar({ label, value, total, note }: AdminProgressBarProps) {
  const percent = total <= 0 ? 0 : Math.round((value / total) * 100);

  return (
    <div className="admin-progress">
      <div className="admin-progress__top">
        <strong>{label}</strong>
        <span>{value}/{total} · {percent}%</span>
      </div>
      <div className="admin-progress__track">
        <span style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }} />
      </div>
      {note && <small>{note}</small>}
    </div>
  );
}

export default AdminProgressBar;
