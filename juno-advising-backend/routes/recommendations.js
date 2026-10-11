const express = require("express");
const router = express.Router();
const db = require("../db");

const {
  generateRecommendations
} = require("../services/recommendationService");

// GET saved recommendations
router.get("/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(400).json({
        error: "Invalid user ID"
      });
    }

    const result = await db.query(
      `SELECT id, recommendation_type,
              title, message, is_read, created_at
       FROM recommendations
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Recommendation error:", error);

    res.status(500).json({
      error: "Failed to retrieve recommendations"
    });
  }
});

// POST generate recommendations
router.post("/:userId/generate", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(400).json({
        error: "Invalid user ID"
      });
    }

    const {
      budgets,
      forecasts,
      monthlyIncome,
      monthlyExpenses
    } = req.body;

    if (
      !Array.isArray(budgets) ||
      !Array.isArray(forecasts) ||
      ![monthlyIncome, monthlyExpenses].every(
        (n) => typeof n === "number" && Number.isFinite(n) && n >= 0
      ) ||
      !budgets.every(
        (b) => typeof b.category === "string" &&
          Number.isFinite(b.limit) && Number.isFinite(b.spent)
      ) ||
      !forecasts.every(
        (f) => Number.isInteger(f.month) &&
          Number.isFinite(f.predictedBalance)
      )
    ) {
      return res.status(400).json({
        error: "Invalid recommendation inputs"
      });
    }

    const userCheck = await db.query(
      "SELECT id FROM users WHERE id = $1",
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    const recommendations = generateRecommendations(
      budgets,
      forecasts,
      monthlyIncome,
      monthlyExpenses
    );

    const saved = [];

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      for (const rec of recommendations) {
        const result = await client.query(
          `INSERT INTO recommendations
           (user_id, recommendation_type, title, message)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [userId, rec.type, rec.title, rec.message]
        );

        saved.push(result.rows[0]);
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    res.status(201).json({
      message: "Recommendations generated successfully",
      recommendations: saved
    });

  } catch (error) {
    console.error("Generate recommendations error:", error);

    res.status(500).json({
      error: "Failed to generate recommendations"
    });
  }
});

module.exports = router;
