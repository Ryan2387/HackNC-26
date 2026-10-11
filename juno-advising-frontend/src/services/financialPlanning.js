
const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

export async function getFinancialPlan(customerId) {
  const query = new URLSearchParams({ customerId });
  const response = await fetch(
    `${API_BASE}/api/planning/dashboard?${query}`
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load financial plan"
    );
  }

  return response.json();
}

export async function simulatePurchase(
  purchaseAmount,
  buffer,
  customerId
) {
  const response = await fetch(
    `${API_BASE}/api/planning/simulate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        purchaseAmount,
        buffer,
        customerId
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to calculate simulation"
    );
  }

  return response.json();
}
