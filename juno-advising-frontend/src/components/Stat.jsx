import Card from './Card';

export default function Stat({ label, value, detail, icon: Icon, positive = false }) {
  return (
    <Card className="stat">
    <div className="stat-top">
      <span>{label}</span>
      <span className="icon-tile">
        <Icon size={18} />
      </span>
    </div>
    <strong>{value}</strong>
    <small className={positive ? 'green' : ''}>{detail}</small>
  </Card>
  );
}
