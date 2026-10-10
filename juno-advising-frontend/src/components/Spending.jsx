import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { DEMO } from '../data/demo';
import { money } from '../utils/format';
import Card from './Card';

export default function Spending() {
  return (
    <Card>
    <div className="section-heading">
      <div>
        <h3>Spending breakdown</h3>
        <p>Illustrative category totals</p>
      </div>
    </div>
    <div className="spending-wrap">
      <div className="donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={DEMO.spending} dataKey="value" innerRadius={60} outerRadius={88} paddingAngle={4} stroke="none">{DEMO.spending.map(x => <Cell key={x.name} fill={x.color} />)}</Pie>
            <Tooltip formatter={v => money(v)} contentStyle={{ background: '#152237', border: '1px solid #34455d', borderRadius: 12, color: '#fff' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="legend">{DEMO.spending.map(x => <div key={x.name}>
        <span>
          <i style={{ background: x.color }} />{x.name}</span>
        <strong>{money(x.value)}</strong>
      </div>)}</div>
    </div>
  </Card>
  );
}
