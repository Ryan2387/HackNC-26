const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all users
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM users ORDER BY id"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve users" });
  }
});

// GET one user
router.get("/:id", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM users WHERE id = $1",
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve user" });
  }
});

// POST create user
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      monthly_income = 0,
      current_balance = 0,
    } = req.body;

    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !email.trim() ||
      !Number.isFinite(Number(monthly_income)) ||
      !Number.isFinite(Number(current_balance)) ||
      Number(monthly_income) < 0
    ) {
      return res.status(400).json({ error: "Invalid user information" });
    }

    const result = await db.query(
      `INSERT INTO users
       (name, email, monthly_income, current_balance)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        monthly_income,
        current_balance,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }

    console.error(error);
    res.status(500).json({ error: "Could not create user" });
  }
});

// PATCH update financial profile
router.patch("/:id", async (req, res) => {
  try {
    const { name, monthly_income, current_balance } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Invalid name" });
      }
      values.push(name.trim());
      updates.push(`name = $${values.length}`);
    }

    for (const field of ["monthly_income", "current_balance"]) {
      if (req.body[field] !== undefined) {
        const value = Number(req.body[field]);

        if (!Number.isFinite(value) ||
            (field === "monthly_income" && value < 0)) {
          return res.status(400).json({ error: `Invalid ${field}` });
        }

        values.push(value);
        updates.push(`${field} = $${values.length}`);
      }
    }

    if (!updates.length) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(req.params.id);

    const result = await db.query(
      `UPDATE users SET ${updates.join(", ")}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update user" });
  }
});

module.exports = router;
