const express = require("express");
const router = express.Router();
const db = require("../db");

const {
  calculateBudget
} = require("../services/budgetService");

// GET budgets for a user
router.get("/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(400).json({
        error: "Invalid user ID"
      });
    }

    const result = await db.query(
      `SELECT id, category, monthly_limit
       FROM budgets
       WHERE user_id = $1`,
      [userId]
    );

    // Temporary spending data for testing
    const mockSpending = {
      Groceries: 185,
      Entertainment: 120,
      Transportation: 75
    };

    const budgets = result.rows.map((budget) => {
      const limit = Number(budget.monthly_limit);
      const spent = mockSpending[budget.category] ?? 0;

      return {
        id: budget.id,
        category: budget.category,
        ...calculateBudget(limit, spent)
      };
    });

    res.json(budgets);

  } catch (error) {
    console.error("Budget error:", error);

    res.status(500).json({
      error: "Failed to retrieve budgets"
    });
  }
});

module.exports = router;