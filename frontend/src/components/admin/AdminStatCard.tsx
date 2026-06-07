type AdminStatCardProps = {
  label: string;
  value: number | string;
  note?: string;
  icon?: string;
};

function AdminStatCard({ label, value, note, icon = '▦' }: AdminStatCardProps) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-card__icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {note && <small>{note}</small>}
      </div>
    </div>
  );
}

export default AdminStatCard;
