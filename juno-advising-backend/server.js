
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));

app.use(express.json());

// Test whether the backend is running
app.get("/", (req, res) => {
  res.json({
    message: "Juno Advising API is running!"
  });
});

// Test the TigerData connection
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT NOW() AS current_time"
    );

    res.json({
      message: "Successfully connected to TigerData!",
      time: result.rows[0].current_time
    });

  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      error: "Failed to connect to TigerData"
    });
  }
});

// Get all users (temporary testing route)
app.get("/api/users", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, email, nessie_customer_id FROM users"
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Error fetching users:", error);

    res.status(500).json({
      error: "Failed to fetch users"
    });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Juno backend running on port ${PORT}`);
});
