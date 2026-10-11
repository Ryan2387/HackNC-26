
function generateRecommendations(budgets, forecasts, monthlyIncome, monthlyExpenses) {
  const recommendations = [];

  // Rule 1: Check budgets
  for (const budget of budgets) {
    if (
      !Number.isFinite(budget.limit) ||
      !Number.isFinite(budget.spent) ||
      budget.limit <= 0
    ) {
      continue;
    }

    const percentageUsed = (budget.spent / budget.limit) * 100;

    if (percentageUsed >= 100) {
      recommendations.push({
        type: "budget_warning",
        title: `${budget.category} Budget Exceeded`,
        message: `You've reached or exceeded your $${budget.limit.toFixed(2)} budget for ${budget.category}.`
      });
    } else if (percentageUsed >= 80) {
      recommendations.push({
        type: "budget_warning",
        title: `${budget.category} Spending Warning`,
        message: `You've used ${percentageUsed.toFixed(1)}% of your ${budget.category} budget.`
      });
    }
  }

  // Rule 2: Check future balances
  const lowBalance = forecasts.find(
    (forecast) => forecast.predictedBalance < 500
  );

  if (lowBalance) {
    recommendations.push({
      type: "forecast_warning",
      title: "Low Balance Warning",
      message: `Your projected balance may fall below $500 in month ${lowBalance.month}.`
    });
  }

  // Rule 3: Suggest savings
  const surplus = monthlyIncome - monthlyExpenses;

  if (surplus > 0) {
    const suggestedSavings = surplus * 0.2;

    recommendations.push({
      type: "savings_tip",
      title: "Savings Opportunity",
      message: `Consider setting aside $${suggestedSavings.toFixed(2)} each month toward your financial goals.`
    });
  }

  return recommendations;
}

module.exports = { generateRecommendations };
