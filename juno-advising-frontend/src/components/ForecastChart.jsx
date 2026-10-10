import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DEMO } from '../data/demo';
import { money } from '../utils/format';

export default function ForecastChart({ purchase = 0 }) {
  const data = DEMO.forecast.map((p, i) => ({ ...p, balance: Math.max(0, p.balance - (i > 0 ? purchase : 0)) }));
  return (
    <div className="chart">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 5, left: -14, bottom: 0 }}>
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#55d4b8" stopOpacity={.24} />
            <stop offset="100%" stopColor="#55d4b8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#25344a" strokeDasharray="4 5" vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#8c9ab0', fontSize: 11 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#8c9ab0', fontSize: 11 }} tickFormatter={v => '$' + (v / 1000).toFixed(1) + 'k'} />
        <Tooltip contentStyle={{ background: '#152237', border: '1px solid #34455d', borderRadius: 12, color: '#fff' }} formatter={v => money(v)} />
        <Area type="monotone" dataKey="balance" name="Projected balance" stroke="#59d9bd" strokeWidth={3} fill="url(#chartFill)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
  );
}
