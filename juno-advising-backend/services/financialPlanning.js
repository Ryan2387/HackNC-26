const round = value =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const DAY_MS = 24 * 60 * 60 * 1000;
const HISTORY_WINDOW_DAYS = 30;
const MINIMUM_HISTORY_TRANSACTIONS = 3;

function dateString(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return dateString(date);
}

function estimateDailyNetFlow(context) {
  const windowStart = addDays(
    context.asOf,
    -HISTORY_WINDOW_DAYS
  );

  const transactions = (context.checkingTransactions || [])
    .filter(transaction =>
      transaction.date >= windowStart &&
      transaction.date < context.asOf &&
      Number.isFinite(Number(transaction.amount))
    );

  if (transactions.length < MINIMUM_HISTORY_TRANSACTIONS) {
    return 0;
  }

  const netFlow = transactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount),
    0
  );

  return round(netFlow / HISTORY_WINDOW_DAYS);
}

function calculatePlan(context, {
  purchaseAmount = 0,
  buffer = 500
} = {}) {
  const balance = Number(context.checkingBalance);

  if (!Number.isFinite(balance)) {
    throw new Error("Checking balance is unavailable");
  }

  if (
    !Number.isFinite(purchaseAmount) ||
    !Number.isFinite(buffer) ||
    purchaseAmount < 0 ||
    buffer < 0
  ) {
    throw new Error("Invalid simulation values");
  }

  const today = context.asOf;
  const endDate = addDays(today, 30);

  // Only subtract bills paid from checking.
  // Bills on savings or credit cards affect
  // those accounts, not this checking balance.
  const upcomingBills = context.bills
    .filter(bill => {
      const amount = Number(bill.amount);
      const date = bill.upcomingPaymentDate;

      return (
        String(bill.status).toLowerCase() === "pending" &&
        bill.accountId === context.checkingAccountId &&
        typeof date === "string" &&
        date >= today &&
        date <= endDate &&
        Number.isFinite(amount) &&
        amount > 0
      );
    })
    .sort((a, b) =>
      a.upcomingPaymentDate.localeCompare(
        b.upcomingPaymentDate
      )
    );

  const totalUpcomingBills = round(
    upcomingBills.reduce(
      (sum, bill) => sum + Number(bill.amount),
      0
    )
  );
  const projectedDailyNetFlow = estimateDailyNetFlow(context);

  // Conservative calculation:
  // No hypothetical future income is assumed.
  // Unscheduled future spending is not yet modeled.
  const safeToSpend = Math.max(
    0,
    round(balance - totalUpcomingBills - buffer)
  );

  // Carry recent net flow forward and apply known scheduled bills.
  const forecast = [];

  let runningBalance = balance;
  let billIndex = 0;

  for (let day = 0; day <= 30; day++) {
    const date = addDays(today, day);

    if (day > 0) {
      runningBalance += projectedDailyNetFlow;
    }

    while (
      billIndex < upcomingBills.length &&
      upcomingBills[billIndex].upcomingPaymentDate <= date
    ) {
      runningBalance -= Number(
        upcomingBills[billIndex].amount
      );
      billIndex++;
    }

    forecast.push({
      date,
      day: day === 0 ? "Today" : date.slice(5),
      balance: round(runningBalance)
    });
  }

  // Hypothetical purchase occurs immediately.
  const simulatedForecast = forecast.map(point => ({
    ...point,
    balance: round(point.balance - purchaseAmount)
  }));

  const lowestBalance = Math.min(
    ...simulatedForecast.map(point => point.balance)
  );

  const simulatedEndingBalance =
    simulatedForecast.at(-1).balance;

  return {
    asOf: today,
    startingBalance: round(balance),
    safeToSpend,
    totalUpcomingBills,
    projectedDailyNetFlow,
    buffer,
    forecast,
    upcomingBills,
    simulation: {
      purchaseAmount: round(purchaseAmount),
      buffer: round(buffer),
      lowestBalance: round(lowestBalance),
      endingBalance: simulatedEndingBalance,
      safe: lowestBalance >= buffer,
      forecast: simulatedForecast
    },
    methodology:
      "Recent average daily net flow from completed checking transactions, " +
      "plus the checking balance, minus known pending checking-account bills. " +
      "This assumes recent activity continues and may not reflect one-time transactions. " +
      "The projection is not a complete spending forecast."
  };
}

module.exports = { calculatePlan };
