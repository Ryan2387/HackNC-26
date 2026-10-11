
const db = require("../db");
const nessie = require("./nessie");

const money = value =>
  Math.round(Number(value) * 100) / 100;

function isCompleted(transaction) {
  const status = String(
    transaction.status || "completed"
  ).toLowerCase();

  return ![
    "pending",
    "failed",
    "cancelled",
    "canceled"
  ].includes(status);
}

async function getFinancialContext(customerId, userId) {
  const accounts = await nessie.getCustomerAccounts(
    customerId
  );

  if (!Array.isArray(accounts) || !accounts.length) {
    throw new Error("No Nessie accounts found");
  }

  const checking = accounts.find(
    account =>
      String(account.type).toLowerCase() === "checking"
  );

  const [accountDetails, bills] = await Promise.all([
    checking ? nessie.getAccount(checking._id) : null,
    nessie.getCustomerBills(customerId)
  ]);

  const accountIds = accounts.map(a => a._id);

  const nessieRows = await Promise.all(
    accounts.map(async account => {
      const [deposits, withdrawals] = await Promise.all([
        nessie.getAccountDeposits(account._id),
        nessie.getAccountWithdrawals(account._id)
      ]);

      return [
        ...deposits
          .filter(isCompleted)
          .map(d => ({
            id: `deposit:${d._id}`,
            accountId: account._id,
            type: "deposit",
            date: d.transaction_date,
            description: d.description || "Deposit",
            amount: Number(d.amount)
          })),

        ...withdrawals
          .filter(isCompleted)
          .map(w => ({
            id: `withdrawal:${w._id}`,
            accountId: account._id,
            type: "withdrawal",
            date: w.transaction_date,
            description: w.description || "Withdrawal",
            amount: -Math.abs(Number(w.amount))
          }))
      ];
    })
  );

  const purchaseResult = await db.query(
    `SELECT id, account_id, transaction_date, description,
            amount, status
     FROM purchase
     WHERE account_id = ANY($1::varchar[])
     ORDER BY transaction_date DESC`,
    [accountIds]
  );

  const purchases = purchaseResult.rows
    .filter(isCompleted)
    .map(p => ({
      id: `purchase:${p.id}`,
      accountId: p.account_id,
      type: "purchase",
      date: new Date(p.transaction_date)
        .toISOString().slice(0, 10),
      description: p.description || "Purchase",
      amount: -Math.abs(Number(p.amount))
    }));

  const transactions = [
    ...nessieRows.flat(),
    ...purchases
  ]
    .filter(t =>
      /^\d{4}-\d{2}-\d{2}/.test(t.date) &&
      Number.isFinite(t.amount)
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const months = {};

  for (const transaction of transactions) {
    const month = transaction.date.slice(0, 7);

    if (!months[month]) {
      months[month] = {
        evidenceId: `month:${month}`,
        month,
        deposits: 0,
        purchases: 0,
        withdrawals: 0,
        netFlow: 0
      };
    }

    const row = months[month];
    const amount = transaction.amount;

    if (transaction.type === "deposit") {
      row.deposits += amount;
    }

    if (transaction.type === "purchase") {
      row.purchases += Math.abs(amount);
    }

    if (transaction.type === "withdrawal") {
      row.withdrawals += Math.abs(amount);
    }

    row.netFlow += amount;
  }

  const monthlyTotals = Object.values(months)
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 6)
    .map(row => ({
      ...row,
      deposits: money(row.deposits),
      purchases: money(row.purchases),
      withdrawals: money(row.withdrawals),
      netFlow: money(row.netFlow)
    }));

  let forecasts = [];

  if (userId) {
    const result = await db.query(
      `SELECT forecast_date, predicted_balance,
              model_version
       FROM forecasts
       WHERE user_id = $1
         AND forecast_date >= CURRENT_DATE
       ORDER BY forecast_date ASC
       LIMIT 12`,
      [userId]
    );

    forecasts = result.rows.map(f => {
      const date = new Date(f.forecast_date)
        .toISOString().slice(0, 10);

      return {
        evidenceId: `forecast:${date}`,
        date,
        predictedBalance: Number(f.predicted_balance),
        modelVersion: f.model_version
      };
    });
  }

  return {
    asOf: new Date().toISOString().slice(0, 10),
    currency: "USD",
    checkingAccountId: checking?._id || null,
    checkingBalance: checking
      ? Number(accountDetails.balance)
      : null,
    checkingTransactions: transactions
      .filter(transaction =>
        transaction.accountId === checking?._id
      )
      .slice(0, 40),
    monthlyTotals,
    recentTransactions: transactions.slice(0, 40),
    bills: (Array.isArray(bills) ? bills : [])
      .map(b => ({
        id: `bill:${b._id}`,
        payee: b.payee,
        amount: Number(b.payment_amount ?? b.amount),
        paymentDate: b.payment_date,
        upcomingPaymentDate: b.upcoming_payment_date,
        accountId: b.account_id,
        status: b.status
      })),
    forecasts,
    limitations: [
      "Deposits are not necessarily earned income.",
      "Transfers are excluded from spending totals.",
      "Bills may not represent completed payments.",
      "Purchases are sourced from TigerData.",
      "Forecasts are estimates, not guarantees."
    ]
  };
}

module.exports = { getFinancialContext };
