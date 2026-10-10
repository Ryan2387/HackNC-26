import { useState } from 'react';
import { SlidersHorizontal, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DEMO } from '../data/demo';
import { money } from '../utils/format';
import Card from './Card';

export default function Simulator() {
  const [amount, setAmount] = useState(250);
  const [buffer, setBuffer] = useState(500);
  const base = DEMO.forecast.at(-1).balance;
  const lowest = Math.min(...DEMO.forecast.slice(1).map(p => p.balance)) - amount;
  const safe = lowest >= buffer;
  return (
    <Card className="sim-card">
    <div className="section-heading">
      <div>
        <div className="eyebrow">WHAT-IF SIMULATOR</div>
        <h3>Can I afford this?</h3>
        <p>See how a purchase changes your future balance.</p>
      </div>
      <span className="icon-tile mint">
        <SlidersHorizontal size={19} />
      </span>
    </div>
    <div className="field-label">
      <label htmlFor="amount">Purchase amount</label>
      <strong>{money(amount)}</strong>
    </div>
    <input id="amount" type="range" min="0" max="1200" step="25" value={amount} onChange={e => setAmount(Number(e.target.value))} />
    <div className="range-ends">
      <span>$0</span>
      <span>$1,200</span>
    </div>
    <div className="field-label">
      <label htmlFor="buffer">Minimum safety cushion</label>
      <strong>{money(buffer)}</strong>
    </div>
    <input id="buffer" type="range" min="0" max="1000" step="50" value={buffer} onChange={e => setBuffer(Number(e.target.value))} />
    <div className="sim-result">
      <div className={'status-icon ' + (safe ? 'safe' : 'risk')}>{safe ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}</div>
      <div>
        <strong>{safe ? 'Looks manageable' : 'Consider waiting'}</strong>
        <p>Your lowest projected balance would be <b>{money(lowest)}</b>. {safe ? 'It stays above your selected cushion.' : 'It falls below your selected cushion.'}</p>
      </div>
    </div>
    <small className="muted">Illustrative estimate. Does not account for all possible expenses.</small>
  </Card>
  );
}
