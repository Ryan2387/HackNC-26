import { CalendarDays } from 'lucide-react';
import { DEMO } from '../data/demo';
import { money } from '../utils/format';
import Card from './Card';

export default function Bills() {
  return (
    <Card>
    <div className="section-heading">
      <div>
        <h3>Upcoming bills</h3>
        <p>Keep important payments in sight</p>
      </div>
      <CalendarDays size={19} className="muted" />
    </div>{DEMO.bills.map(b => <div className="bill" key={b.name}>
      <div className="bill-icon">
        <CalendarDays size={17} />
      </div>
      <div>
        <strong>{b.name}</strong>
        <span>{b.due}</span>
      </div>
      <strong>{money(b.amount)}</strong>
    </div>)}</Card>
  );
}
