function generateForecast(
  startingBalance,
  monthlyIncome,
  monthlyExpenses,
  months
) {
  let balance = startingBalance;
  const forecasts = [];

  for (let month = 1; month <= months; month++) {
    balance =
      balance + monthlyIncome - monthlyExpenses;

    forecasts.push({
      month,
      predictedBalance: Number(balance.toFixed(2))
    });
  }

  return forecasts;
}

module.exports = { generateForecast };
