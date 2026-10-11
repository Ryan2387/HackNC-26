const express = require("express");
const router = express.Router();
const db = require("../db");

const {
  generateForecast
} = require("../services/forecastsService");


// Validate user IDs
function parseUserId(value) {
  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

// GET: Retrieve saved forecasts
router.get("/:userId", async (req, res) => {
  try {
    const userId = parseUserId(req.params.userId);

    if (!userId) {
      return res.status(400).json({
        error: "Invalid user ID"
      });
    }

    const result = await db.query(
      `SELECT id, user_id, forecast_date,
              predicted_balance, model_version
       FROM forecasts
       WHERE user_id = $1
       ORDER BY forecast_date ASC, id ASC`,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Error retrieving forecasts:", error);

    res.status(500).json({
      error: "Failed to retrieve forecasts"
    });
  }
});

// POST: Generate and save forecasts
router.post("/:userId", async (req, res) => {
  try {
    const userId = parseUserId(req.params.userId);

    if (!userId) {
      return res.status(400).json({
        error: "Invalid user ID"
      });
    }

    const {
      startingBalance,
      monthlyIncome,
      monthlyExpenses,
      months
    } = req.body;

    // Validate required numbers
    const amounts = [
      startingBalance,
      monthlyIncome,
      monthlyExpenses
    ];

    if (
      !amounts.every(
        (value) =>
          typeof value === "number" &&
          Number.isFinite(value)
      ) ||
      monthlyIncome < 0 ||
      monthlyExpenses < 0 ||
      !Number.isInteger(months) ||
      months < 1 ||
      months > 12
    ) {
      return res.status(400).json({
        error: "Invalid forecast inputs"
      });
    }

    // Check that the user exists
    const userResult = await db.query(
      "SELECT id FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    // Calculate future balances
    const forecasts = generateForecast(
      startingBalance,
      monthlyIncome,
      monthlyExpenses,
      months
    );

    // Save forecasts atomically
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const savedForecasts = [];

      for (const forecast of forecasts) {
        // End of each projected calendar month
        const today = new Date();
        const forecastDate = new Date(Date.UTC(
          today.getFullYear(),
          today.getMonth() + forecast.month + 1,
          0
        )).toISOString().slice(0, 10);

        const result = await client.query(
          `INSERT INTO forecasts
            (user_id, forecast_date,
             predicted_balance, model_version)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [
            userId,
            forecastDate,
            forecast.predictedBalance,
            "rule-based-v1"
          ]
        );

        savedForecasts.push(result.rows[0]);
      }

      await client.query("COMMIT");

      res.status(201).json({
        message: "Forecasts generated successfully",
        forecasts: savedForecasts
      });

    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error("Error generating forecasts:", error);

    res.status(500).json({
      error: "Failed to generate forecasts"
    });
  }
});

module.exports = router;
