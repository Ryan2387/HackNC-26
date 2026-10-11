import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { money } from '../utils/format';
import Card from './Card';

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

const categories = [
  { name: 'Housing', color: '#587df6', matches: /rent|mortgage|lease|housing|property|utility|electric|water/i },
  { name: 'Food', color: '#47d4bc', matches: /grocery|market|restaurant|cafe|coffee|dining|food/i },
  { name: 'Transport', color: '#f6ba65', matches: /gas|fuel|transit|uber|lyft|parking|auto/i },
  { name: 'Shopping', color: '#a98bfa', matches: /shop|store|retail|amazon/i },
];

export default function Spending({ customerId }) {
  const [transactions, setTransactions] = useState(null);

  useEffect(() => {
    let active = true;
    setTransactions(null);

    fetch(`${API_BASE}/api/nessie/customers/${customerId}/transactions`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to retrieve transactions');
        }
        return response.json();
      })
      .then(data => {
        if (active) setTransactions(data);
      })
      .catch(error => {
        console.error('Nessie spending error:', error);
        if (active) setTransactions([]);
      });

    return () => {
      active = false;
    };
  }, [customerId]);

  const totals = new Map(categories.map(category => [category.name, 0]));
  let other = 0;

  for (const transaction of transactions || []) {
    const signedAmount = Number(transaction.amount);
    if (!Number.isFinite(signedAmount) || signedAmount >= 0) continue;
    const amount = Math.abs(signedAmount);

    const description = String(transaction.description || '');
    const category = categories.find(item => item.matches.test(description));
    if (category) {
      totals.set(category.name, totals.get(category.name) + amount);
    } else {
      other += amount;
    }
  }

  const spending = [
    ...categories.map(category => ({
      name: category.name,
      value: totals.get(category.name),
      color: category.color,
    })),
    { name: 'Other', value: other, color: '#94a3b8' },
  ].filter(category => category.value > 0);

  return (
    <Card>
    <div className="section-heading">
      <div>
        <h3>Spending breakdown</h3>
        <p>Estimated from recent outgoing transactions</p>
      </div>
    </div>
    {transactions === null ? (
      <p>Loading spending activity...</p>
    ) : spending.length === 0 ? (
      <p>No withdrawal transactions to categorize.</p>
    ) : <div className="spending-wrap">
      <div className="donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={spending} dataKey="value" innerRadius={60} outerRadius={88} paddingAngle={4} stroke="none">{spending.map(x => <Cell key={x.name} fill={x.color} />)}</Pie>
            <Tooltip formatter={v => money(v)} contentStyle={{ background: '#152237', border: '1px solid #34455d', borderRadius: 12, color: '#fff' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="legend">{spending.map(x => <div key={x.name}>
        <span>
          <i style={{ background: x.color }} />{x.name}</span>
        <strong>{money(x.value)}</strong>
      </div>)}</div>
    </div>}
  </Card>
  );
}
