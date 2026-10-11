const express = require("express");
const router = express.Router();
const nessie = require("../services/nessie");
const db = require("../db");

// Get one customer by ID
router.get("/customers/:customerId", async (req, res) => {
  try {
    const customer = await nessie.getCustomer(
      req.params.customerId
    );

    res.json(customer);
  } catch (error) {
    console.error("Nessie customer error:", error);

    res.status(502).json({
      error: "Failed to retrieve Nessie customer"
    });
  }
});

// Get all accounts for a customer
router.get("/customers/:customerId/accounts", async (req, res) => {
  try {
    const accounts = await nessie.getCustomerAccounts(
      req.params.customerId
    );

    res.json(accounts);
  } catch (error) {
    console.error("Nessie accounts error:", error);

    res.status(502).json({
      error: "Failed to retrieve Nessie accounts"
    });
  }
});

// Get one account, including its balance
router.get("/accounts/:accountId", async (req, res) => {
  try {
    const account = await nessie.getAccount(
      req.params.accountId
    );

    res.json(account);
  } catch (error) {
    console.error("Nessie account error:", error);

    res.status(502).json({
      error: "Failed to retrieve Nessie account"
    });
  }
});

// Get deposits for an account
router.get("/accounts/:accountId/deposits", async (req, res) => {
  try {
    const deposits = await nessie.getAccountDeposits(
      req.params.accountId
    );

    res.json(deposits);
  } catch (error) {
    console.error("Nessie deposits error:", error);

    res.status(502).json({
      error: "Failed to retrieve Nessie deposits"
    });
  }
});

// Get withdrawals for an account
router.get("/accounts/:accountId/withdrawals", async (req, res) => {
  try {
    const withdrawals = await nessie.getAccountWithdrawals(
      req.params.accountId
    );

    res.json(withdrawals);
  } catch (error) {
    console.error("Nessie withdrawals error:", error);

    res.status(502).json({
      error: "Failed to retrieve Nessie withdrawals"
    });
  }
});

// Get bills for a customer
router.get("/customers/:customerId/bills", async (req, res) => {
  try {
    const bills = await nessie.getCustomerBills(
      req.params.customerId
    );

    res.json(bills);
  } catch (error) {
    console.error("Nessie bills error:", error);

    res.status(502).json({
      error: "Failed to retrieve Nessie bills"
    });
  }
});

// Get a customer's checking account balance
router.get("/customers/:customerId/checking-balance", async (req, res) => {
  try {
    const accounts = await nessie.getCustomerAccounts(
      req.params.customerId
    );

    const checking = accounts.find(
      account => account.type === "Checking"
    );

    if (!checking) {
      return res.status(404).json({
        error: "Checking account not found"
      });
    }

    const account = await nessie.getAccount(checking._id);

    res.json({
      accountId: account._id,
      balance: account.balance
    });
  } catch (error) {
    console.error("Nessie checking balance error:", error);

    res.status(502).json({
      error: "Failed to retrieve checking balance"
    });
  }
});

// Get the latest month with completed checking income
router.get("/customers/:customerId/monthly-income", async (req, res) => {
  try {
    const accounts = await nessie.getCustomerAccounts(
      req.params.customerId
    );

    const checking = accounts.find(
      account => account.type === "Checking"
    );

    if (!checking) {
      return res.status(404).json({
        error: "Checking account not found"
      });
    }

    const deposits = await nessie.getAccountDeposits(
      checking._id
    );

    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const lookbackDate = new Date(
      now.getTime() - 90 * 24 * 60 * 60 * 1000
    ).toISOString().slice(0, 10);
    const incomeByMonth = new Map();

    for (const deposit of deposits) {
      const date = String(deposit.transaction_date || "").slice(0, 10);
      const amount = Number(deposit.amount);
      const status = String(
        deposit.status || "completed"
      ).toLowerCase();

      if (
        date < lookbackDate ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        status !== "completed" ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        continue;
      }

      const month = date.slice(0, 7);
      incomeByMonth.set(
        month,
        (incomeByMonth.get(month) || 0) + amount
      );
    }

    const incomePeriod = incomeByMonth.has(currentMonth)
      ? currentMonth
      : [...incomeByMonth.keys()].sort().at(-1) || null;
    const monthlyIncome = incomePeriod
      ? incomeByMonth.get(incomePeriod)
      : 0;

    res.json({
      monthlyIncome:
        Math.round(monthlyIncome * 100) / 100,
      incomePeriod
    });
  } catch (error) {
    console.error("Nessie monthly income error:", error);

    res.status(502).json({
      error: "Failed to retrieve monthly income"
    });
  }
});

// Get deposits and withdrawals across all customer accounts
router.get("/customers/:customerId/transactions", async (req, res) => {
  try {
    const accounts = await nessie.getCustomerAccounts(
      req.params.customerId
    );

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

    res.status(502).json({
      error: "Failed to retrieve Nessie transactions"
    });
  }
});

// Combine TigerData purchases/transfers with Nessie deposits/withdrawals
router.get("/customers/:customerId/all-transactions", async (req, res) => {
  try {
    const { customerId } = req.params;

    // 1. Get the customer's accounts from Nessie
    const accounts = await nessie.getCustomerAccounts(
      customerId
    );

    const accountIds = accounts.map(account => account._id);

    const accountNames = new Map(
      accounts.map(account => [
        account._id,
        account.nickname
      ])
    );

    // 2. Retrieve deposits and withdrawals from Nessie
    const nessieResults = await Promise.all(
      accounts.map(async account => {
        const [deposits, withdrawals] = await Promise.all([
          nessie.getAccountDeposits(account._id),
          nessie.getAccountWithdrawals(account._id)
        ]);

        return [
          ...deposits.map(deposit => ({
            id: `nessie-deposit-${deposit._id}`,
            source: "nessie",
            type: "deposit",
            account: account.nickname,
            description: deposit.description,
            date: deposit.transaction_date,
            amount: Number(deposit.amount)
          })),
          ...withdrawals.map(withdrawal => ({
            id: `nessie-withdrawal-${withdrawal._id}`,
            source: "nessie",
            type: "withdrawal",
            account: account.nickname,
            description: withdrawal.description,
            date: withdrawal.transaction_date,
            amount: -Math.abs(Number(withdrawal.amount))
          }))
        ];
      })
    );

    const nessieTransactions = nessieResults.flat();

    // 3. Get purchases associated with Nessie accounts
    const purchasesResult = await db.query(
      `SELECT id, transaction_date, status, amount,
              description, account_id
       FROM purchase
       WHERE account_id = ANY($1::varchar[])`,
      [accountIds]
    );

    const purchases = purchasesResult.rows.map(purchase => ({
      id: `tiger-purchase-${purchase.id}`,
      source: "tigerdata",
      type: "purchase",
      account: accountNames.get(purchase.account_id),
      description: purchase.description,
      date: purchase.transaction_date
        .toISOString()
        .slice(0, 10),
      amount: -Math.abs(Number(purchase.amount))
    }));

    // 4. Get transfers associated with Nessie accounts
    const transfersResult = await db.query(
      `SELECT transfer_date, status, amount, description,
              origin_account, end_account
       FROM transfer
       WHERE origin_account = ANY($1::varchar[])
          OR end_account = ANY($1::varchar[])`,
      [accountIds]
    );

    const transfers = transfersResult.rows.map(
      (transfer, index) => {
        const outgoing = accountIds.includes(
          transfer.origin_account
        );

        return {
          id: `tiger-transfer-${index}-${transfer.transfer_date.getTime()}`,
          source: "tigerdata",
          type: "transfer",
          account: outgoing
            ? accountNames.get(transfer.origin_account)
            : accountNames.get(transfer.end_account),
          description: transfer.description,
          date: transfer.transfer_date
            .toISOString()
            .slice(0, 10),
          amount: outgoing
            ? -Math.abs(Number(transfer.amount))
            : Math.abs(Number(transfer.amount))
        };
      }
    );

    // 5. Merge everything
    const allTransactions = [
      ...nessieTransactions,
      ...purchases,
      ...transfers
    ];

    // 6. Sort by date, newest first
    allTransactions.sort(
      (a, b) => b.date.localeCompare(a.date)
    );

    res.json(allTransactions);
  } catch (error) {
    console.error("Combined transactions error:", error);

    res.status(502).json({
      error: "Failed to retrieve combined transactions"
    });
  }
});

// Calculate current month's spending from TigerData purchases
router.get("/customers/:customerId/monthly-spending", async (req, res) => {
  try {
    const accounts = await nessie.getCustomerAccounts(
      req.params.customerId
    );

    const accountIds = accounts.map(
      account => account._id
    );

    const result = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS monthly_spending
       FROM purchase
       WHERE account_id = ANY($1::varchar[])
         AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
         AND transaction_date < DATE_TRUNC('month', CURRENT_DATE)
                                + INTERVAL '1 month'
         AND status = 'completed'`,
      [accountIds]
    );

    res.json({
      monthlySpending:
        Number(result.rows[0].monthly_spending)
    });
  } catch (error) {
    console.error("Monthly spending error:", error);

    res.status(500).json({
      error: "Failed to calculate monthly spending"
    });
  }
});

module.exports = router;
