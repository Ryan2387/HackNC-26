const express = require("express");
const router = express.Router();
const db = require("../db");

const {
  calculateMonthlyExpenses,
  simulateBalance,
} = require("../utils/financial");

// POST run a financial simulation
router.post("/", async (req, res) => {
  try {
    const {
      user_id,
      name = "Untitled Simulation",
      monthly_income_change = 0,
      monthly_expense_change = 0,
      one_time_cost = 0,
      months = 6,
      save = true,
    } = req.body;

    const numericInputs = [
      monthly_income_change,
      monthly_expense_change,
      one_time_cost,
    ];

    if (
      !Number.isInteger(Number(user_id)) ||
      Number(user_id) <= 0 ||
      !Number.isInteger(Number(months)) ||
      Number(months) < 1 ||
      Number(months) > 120 ||
      numericInputs.some((value) => !Number.isFinite(Number(value))) ||
      Number(one_time_cost) < 0 ||
      typeof name !== "string" ||
      name.length > 150 ||
      typeof save !== "boolean"
    ) {
      return res.status(400).json({
        error: "Invalid simulation information",
      });
    }

    const [userResult, budgetResult] = await Promise.all([
      db.query("SELECT * FROM users WHERE id = $1", [user_id]),
      db.query("SELECT * FROM budgets WHERE user_id = $1", [user_id]),
    ]);

    if (!userResult.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    const monthlyExpenses = calculateMonthlyExpenses(
      budgetResult.rows
    );

    if (
      Number(user.monthly_income) + Number(monthly_income_change) < 0 ||
      monthlyExpenses + Number(monthly_expense_change) < 0
    ) {
      return res.status(400).json({
        error: "Simulated income and expenses cannot be negative",
      });
    }

    const result = simulateBalance({
      currentBalance: user.current_balance,
      monthlyIncome: user.monthly_income,
      monthlyExpenses,
      incomeChange: monthly_income_change,
      expenseChange: monthly_expense_change,
      oneTimeCost: one_time_cost,
      months: Number(months),
    });

    let savedSimulation = null;

    if (save) {
      const insertResult = await db.query(
        `INSERT INTO simulations
         (user_id, name, monthly_income_change,
          monthly_expense_change, one_time_cost,
          months, projected_balance)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          user_id,
          name,
          monthly_income_change,
          monthly_expense_change,
          one_time_cost,
          months,
          result.projectedBalance,
        ]
      );

      savedSimulation = insertResult.rows[0];
    }

    res.json({
      user_id: Number(user_id),
      name,
      months: Number(months),
      input: {
        monthly_income_change: Number(monthly_income_change),
        monthly_expense_change: Number(monthly_expense_change),
        one_time_cost: Number(one_time_cost),
      },
      result,
      saved_simulation: savedSimulation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Could not process simulation",
    });
  }
});

// GET saved simulation history
router.get("/:userId", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM simulations
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.params.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Could not retrieve simulations",
    });
  }
});

module.exports = router;
