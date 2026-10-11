const express = require("express");
const router = express.Router();
const db = require("../db");

const {
  calculateGoalProgress,
} = require("../utils/financial");

function formatGoal(goal) {
  return {
    ...goal,
    progress_percentage: calculateGoalProgress(
      goal.current_amount,
      goal.target_amount
    ),
    remaining_amount: Math.max(
      0,
      Number(goal.target_amount) - Number(goal.current_amount)
    ),
    completed: Number(goal.current_amount) >= Number(goal.target_amount),
  };
}

// GET all goals for a user
router.get("/:userId", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM financial_goals
       WHERE user_id = $1
       ORDER BY target_date ASC NULLS LAST, id ASC`,
      [req.params.userId]
    );

    res.json(result.rows.map(formatGoal));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve goals" });
  }
});

// POST create goal
router.post("/", async (req, res) => {
  try {
    const {
      user_id,
      title,
      target_amount,
      current_amount = 0,
      target_date = null,
    } = req.body;

    if (
      !Number.isInteger(Number(user_id)) ||
      Number(user_id) <= 0 ||
      typeof title !== "string" ||
      !title.trim() ||
      !Number.isFinite(Number(target_amount)) ||
      Number(target_amount) <= 0 ||
      !Number.isFinite(Number(current_amount)) ||
      Number(current_amount) < 0
    ) {
      return res.status(400).json({ error: "Invalid goal information" });
    }

    const result = await db.query(
      `INSERT INTO financial_goals
       (user_id, title, target_amount, current_amount, target_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        user_id,
        title.trim(),
        target_amount,
        current_amount,
        target_date,
      ]
    );

    res.status(201).json(formatGoal(result.rows[0]));
  } catch (error) {
    if (error.code === "23503") {
      return res.status(404).json({ error: "User not found" });
    }
    if (error.code === "22007") {
      return res.status(400).json({ error: "Invalid target date" });
    }

    console.error(error);
    res.status(500).json({ error: "Could not create goal" });
  }
});

// PATCH goal
// Include user_id so the change is scoped to the correct user
router.patch("/:goalId", async (req, res) => {
  try {
    const { user_id, title, target_amount, current_amount, target_date } =
      req.body;

    if (!Number.isInteger(Number(user_id)) || Number(user_id) <= 0) {
      return res.status(400).json({ error: "Valid user_id required" });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ error: "Invalid title" });
      }
      values.push(title.trim());
      updates.push(`title = $${values.length}`);
    }

    for (const field of ["target_amount", "current_amount"]) {
      if (req.body[field] !== undefined) {
        const value = Number(req.body[field]);

        if (!Number.isFinite(value) ||
            (field === "target_amount" && value <= 0) ||
            (field === "current_amount" && value < 0)) {
          return res.status(400).json({ error: `Invalid ${field}` });
        }

        values.push(value);
        updates.push(`${field} = $${values.length}`);
      }
    }

    if (target_date !== undefined) {
      values.push(target_date);
      updates.push(`target_date = $${values.length}`);
    }

    if (!updates.length) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(req.params.goalId, user_id);

    const result = await db.query(
      `UPDATE financial_goals
       SET ${updates.join(", ")}
       WHERE id = $${values.length - 1}
       AND user_id = $${values.length}
       RETURNING *`,
      values
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.json(formatGoal(result.rows[0]));
  } catch (error) {
    if (["22007", "23514"].includes(error.code)) {
      return res.status(400).json({ error: "Invalid goal values" });
    }

    console.error(error);
    res.status(500).json({ error: "Could not update goal" });
  }
});

// DELETE goal
router.delete("/:goalId", async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!Number.isInteger(Number(user_id)) || Number(user_id) <= 0) {
      return res.status(400).json({ error: "Valid user_id required" });
    }

    const result = await db.query(
      `DELETE FROM financial_goals
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.goalId, user_id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete goal" });
  }
});

module.exports = router;
