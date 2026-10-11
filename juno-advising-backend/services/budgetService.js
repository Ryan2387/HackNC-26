function calculateBudget(limit, spent) {
  const remaining = limit - spent;

  const percentageUsed =
    limit > 0 ? (spent / limit) * 100 : 0;

  let status = "on_track";

  if (spent >= limit) {
    status = "exceeded";
  } else if (percentageUsed >= 80) {
    status = "warning";
  }

  return {
    limit,
    spent,
    remaining,
    percentageUsed,
    status
  };
}

module.exports = { calculateBudget };
