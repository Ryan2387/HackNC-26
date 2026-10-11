function money(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function calculateMonthlyExpenses(budgets) {
  return money(
    budgets.reduce((total, budget) => {
      return total + Number(budget.spent);
    }, 0)
  );
}

function calculateMonthlySavings(income, expenses) {
  return money(Number(income) - Number(expenses));
}

function calculateGoalProgress(current, target) {
  if (Number(target) <= 0) return 0;

  return money((Number(current) / Number(target)) * 100);
}

function monthsUntilGoal(current, target, monthlySavings) {
  const remaining = Number(target) - Number(current);

  if (remaining <= 0) return 0;
  if (Number(monthlySavings) <= 0) return null;

  return Math.ceil(remaining / Number(monthlySavings));
}

function simulateBalance({
  currentBalance,
  monthlyIncome,
  monthlyExpenses,
  incomeChange = 0,
  expenseChange = 0,
  oneTimeCost = 0,
  months = 6,
}) {
  const baselineMonthlySavings = calculateMonthlySavings(
    monthlyIncome,
    monthlyExpenses
  );

  const newMonthlySavings = calculateMonthlySavings(
    Number(monthlyIncome) + Number(incomeChange),
    Number(monthlyExpenses) + Number(expenseChange)
  );

  const baselineBalance = money(
    Number(currentBalance) + baselineMonthlySavings * months
  );

  const projectedBalance = money(
    Number(currentBalance) -
      Number(oneTimeCost) +
      newMonthlySavings * months
  );

  const difference = money(projectedBalance - baselineBalance);

  const timeline = [];

  for (let month = 0; month <= months; month++) {
    timeline.push({
      month,
      baseline: money(
        Number(currentBalance) + baselineMonthlySavings * month
      ),
      simulated: money(
        Number(currentBalance) -
          Number(oneTimeCost) +
          newMonthlySavings * month
      ),
    });
  }

  return {
    baselineMonthlySavings,
    simulatedMonthlySavings: newMonthlySavings,
    baselineBalance,
    projectedBalance,
    difference,
    timeline,
  };
}

module.exports = {
  money,
  calculateMonthlyExpenses,
  calculateMonthlySavings,
  calculateGoalProgress,
  monthsUntilGoal,
  simulateBalance,
};