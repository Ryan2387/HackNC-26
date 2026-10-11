
const BASE_URL = "https://api.nessieisreal.com";

async function nessieRequest(endpoint) {
  const apiKey = process.env.NESSIE_API_KEY;

  if (!apiKey) {
    throw new Error("NESSIE_API_KEY is not configured");
  }

  const url = new URL(endpoint, BASE_URL);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Nessie API request failed: ${response.status}`
    );
  }

  return response.json();
}

// Get one customer by ID
async function getCustomer(customerId) {
  return nessieRequest(`/customers/${customerId}`);
}

// Get all accounts belonging to a customer
async function getCustomerAccounts(customerId) {
  return nessieRequest(`/customers/${customerId}/accounts`);
}

// Get one account by ID
async function getAccount(accountId) {
  return nessieRequest(`/accounts/${accountId}`);
}

// Get all deposits for an account
async function getAccountDeposits(accountId) {
  return nessieRequest(`/accounts/${accountId}/deposits`);
}

// Get all withdrawals for an account
async function getAccountWithdrawals(accountId) {
  return nessieRequest(`/accounts/${accountId}/withdrawals`);
}

// Get all bills belonging to a customer
async function getCustomerBills(customerId) {
  return nessieRequest(`/customers/${customerId}/bills`);
}

module.exports = {
  getCustomer,
  getCustomerAccounts,
  getAccount,
  getAccountDeposits,
  getAccountWithdrawals,
  getCustomerBills
};
