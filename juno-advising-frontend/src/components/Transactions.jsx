import { DEMO } from '../data/demo';
import { money } from '../utils/format';
import Card from './Card';

export default function Transactions({ full = false }) {
  return (
    <Card>
    <div className="section-heading">
      <div>
        <h3>Recent transactions</h3>
        <p>Your latest account activity</p>
      </div>{!full && <span className="muted tiny">Sample data</span>}</div>
    <div className="transaction-list">{DEMO.transactions.map(t => <div className="transaction" key={t.id}>
      <div className="merchant-icon">{t.icon}</div>
      <div className="transaction-name">
        <strong>{t.merchant}</strong>
        <span>{t.category} · {t.date}</span>
      </div>
      <strong className={t.amount > 0 ? 'green' : ''}>{t.amount > 0 ? '+' : ''}{money(t.amount)}</strong>
    </div>)}</div>
  </Card>
  );
}
