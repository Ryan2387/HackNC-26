export const DEMO = {
  name: 'Alex', balance: 2840.50, income: 3200, spent: 1480.20, safeToSpend: 680,
  transactions: [
    { id: 1, merchant: 'Whole Foods Market', category: 'Groceries', date: 'Oct 9, 2026', amount: -68.42, icon: '🥑' },
    { id: 2, merchant: 'Paycheck', category: 'Income', date: 'Oct 8, 2026', amount: 1600, icon: '💼' },
    { id: 3, merchant: 'Spotify Premium', category: 'Subscriptions', date: 'Oct 7, 2026', amount: -11.99, icon: '🎵' },
    { id: 4, merchant: 'Shell', category: 'Transportation', date: 'Oct 6, 2026', amount: -42.80, icon: '⛽' },
    { id: 5, merchant: 'Chipotle', category: 'Dining', date: 'Oct 5, 2026', amount: -15.75, icon: '🌯' },
  ],
  bills: [{ name: 'Rent', due: 'Oct 15', amount: 950 }, { name: 'Internet', due: 'Oct 19', amount: 65 }, { name: 'Electricity', due: 'Oct 22', amount: 84 }],
  spending: [{ name: 'Housing', value: 950, color: '#587df6' }, { name: 'Food', value: 230, color: '#47d4bc' }, { name: 'Transport', value: 155, color: '#f6ba65' }, { name: 'Other', value: 145, color: '#a98bfa' }],
  forecast: [{ day: 'Today', balance: 2841 }, { day: 'Oct 13', balance: 2720 }, { day: 'Oct 16', balance: 1740 }, { day: 'Oct 19', balance: 1675 }, { day: 'Oct 22', balance: 1591 }, { day: 'Oct 26', balance: 3050 }, { day: 'Oct 30', balance: 2810 }],
};
