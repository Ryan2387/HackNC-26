const express = require("express");
const router = express.Router();
const nessie = require("../services/nessie");

// Get all accounts for a customer
router.get("/customers/:customerId/accounts", async (req, res) => {
  try {
    const accounts = await nessie.getCustomerAccounts(req.params.customerId);
    res.json(accounts);
  } catch (error) {
    console.error("Nessie accounts error:", error);
    res.status(502).json({ error: "Failed to retrieve Nessie accounts" });
  }
});

// Get one account, including its balance
router.get("/accounts/:accountId", async (req, res) => {
  try {
    const account = await nessie.getAccount(req.params.accountId);
    res.json(account);
  } catch (error) {
    console.error("Nessie account error:", error);
    res.status(502).json({ error: "Failed to retrieve Nessie account" });
  }
});

// Get deposits for an account
router.get("/accounts/:accountId/deposits", async (req, res) => {
  try {
    const deposits = await nessie.getAccountDeposits(req.params.accountId);
    res.json(deposits);
  } catch (error) {
    console.error("Nessie deposits error:", error);
    res.status(502).json({ error: "Failed to retrieve Nessie deposits" });
  }
});

// Get withdrawals for an account
router.get("/accounts/:accountId/withdrawals", async (req, res) => {
  try {
    const withdrawals = await nessie.getAccountWithdrawals(req.params.accountId);
    res.json(withdrawals);
  } catch (error) {
    console.error("Nessie withdrawals error:", error);
    res.status(502).json({ error: "Failed to retrieve Nessie withdrawals" });
  }
});

// Get bills for a customer
router.get("/customers/:customerId/bills", async (req, res) => {
  try {
    const bills = await nessie.getCustomerBills(req.params.customerId);
    res.json(bills);
  } catch (error) {
    console.error("Nessie bills error:", error);
    res.status(502).json({ error: "Failed to retrieve Nessie bills" });
  }
});

// Get a customer's checking account balance
router.get("/customers/:customerId/checking-balance", async (req, res) => {
  try {
    const accounts = await nessie.getCustomerAccounts(req.params.customerId);

    const checking = accounts.find(
      account => account.type === "Checking"
    );

    if (!checking) {
      return res.status(404).json({ error: "Checking account not found" });
    }

    const account = await nessie.getAccount(checking._id);

    res.json({
      accountId: account._id,
      balance: account.balance
    });
  } catch (error) {
    console.error("Nessie checking balance error:", error);
    res.status(502).json({ error: "Failed to retrieve checking balance" });
  }
});

// Calculate monthly income from checking account deposits
router.get("/customers/:customerId/monthly-income", async (req, res) => {
  try {
    const accounts = await nessie.getCustomerAccounts(req.params.customerId);

    const checking = accounts.find(
      account => account.type === "Checking"
    );

    if (!checking) {
      return res.status(404).json({ error: "Checking account not found" });
    }

    const deposits = await nessie.getAccountDeposits(checking._id);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const monthlyIncome = deposits
      .filter(deposit => {
        const [depositYear, depositMonth] =
          deposit.transaction_date.split("-").map(Number);

        return (
          depositYear === year &&
          depositMonth === month + 1 &&
          deposit.status === "completed" &&
          deposit.amount > 0
        );
      })
      .reduce((total, deposit) => total + deposit.amount, 0);

    res.json({
      monthlyIncome: Math.round(monthlyIncome * 100) / 100
    });

  } catch (error) {
    console.error("Nessie monthly income error:", error);
    res.status(502).json({ error: "Failed to retrieve monthly income" });
  }
});

// Get deposits and withdrawals across all customer accounts
router.get("/customers/:customerId/transactions", async (req, res) => {
  try {
    const accounts = await nessie.getCustomerAccounts(req.params.customerId);

    const transactionsByAccount = await Promise.all(
      accounts.map(async account => {
        const [deposits, withdrawals] = await Promise.all([
          nessie.getAccountDeposits(account._id),
          nessie.getAccountWithdrawals(account._id)
        ]);

        return [
          ...deposits.map(deposit => ({
            id: deposit._id,
            type: "deposit",
            account: account.nickname,
            description: deposit.description,
            date: deposit.transaction_date,
            amount: deposit.amount
          })),
          ...withdrawals.map(withdrawal => ({
            id: withdrawal._id,
            type: "withdrawal",
            account: account.nickname,
            description: withdrawal.description,
            date: withdrawal.transaction_date,
            amount: -Math.abs(withdrawal.amount)
          }))
        ];
      })
    );

    const transactions = transactionsByAccount
      .flat()
      .sort((a, b) => b.date.localeCompare(a.date));

    res.json(transactions);

  } catch (error) {
    console.error("Nessie transactions error:", error);
    res.status(502).json({ error: "Failed to retrieve Nessie transactions" });
  }
});

module.exports = router;