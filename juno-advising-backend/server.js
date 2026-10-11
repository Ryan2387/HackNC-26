require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");
const aiRoutes = require("./routes/ai");

// Import all routes
const userRoutes = require("./routes/users");
const budgetRoutes = require("./routes/budgets");
const forecastRoutes = require("./routes/forecasts");
const recommendationRoutes = require("./routes/recommendations");
const simulationRoutes = require("./routes/simulations");
const goalRoutes = require("./routes/goals");
const nessieRoutes = require("./routes/nessie");
const financialPlanningRoutes = require("./routes/financialPlanning");

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE

// Allow React frontend to communicate with Express
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));

// Parse incoming JSON requests
app.use(express.json());

// TEST ROUTES

// Check if backend is running
app.get("/", (req, res) => {
  res.json({
    message: "Juno Advising API is running!",
    status: "success"
  });
});

// Test TigerData connection
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT NOW() AS current_time"
    );

    res.json({
      message: "Successfully connected to TigerData!",
      status: "success",
      time: result.rows[0].current_time
    });

  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      error: "Failed to connect to TigerData"
    });
  }
});

// API ROUTES

// Users
app.use("/api/users", userRoutes);

// Budgets
app.use("/api/budgets", budgetRoutes);

// Financial Goals
app.use("/api/goals", goalRoutes);

// Financial Forecasts
app.use("/api/forecasts", forecastRoutes);

// Financial Recommendations
app.use("/api/recommendations", recommendationRoutes);

// Financial Simulations
app.use("/api/simulations", simulationRoutes);

// Capital One Nessie API
app.use("/api/nessie", nessieRoutes);

//AI Routes
app.use("/api", aiRoutes);

app.use("/api/planning", financialPlanningRoutes);

// ERROR HANDLING


// Handle unknown endpoints
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
});

// Handle unexpected errors
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    error: "Internal server error"
  });
});

// START SERVER

app.listen(PORT, () => {
  console.log(`Juno backend running on port ${PORT}`);
});
