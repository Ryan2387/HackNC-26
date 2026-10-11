const express = require("express");
const router = express.Router();

const {
  getFinancialContext
} = require("../services/financialContext");

const {
  calculatePlan
} = require("../services/financialPlanning");

const {
  explainFinancialPlan
} = require("../services/gemini");

const DEFAULT_CUSTOMER_ID =
  "3a0742d9-9abc-4c17-aa09-c42e3d482c06";

// Build financial plan and Gemini explanations
async function buildResponse(customerId, options = {}) {
  const context = await getFinancialContext(
    customerId
  );

  // Calculate financial data first
  const plan = calculatePlan(context, options);

  let explanations;
  let geminiAvailable = true;

  try {
    explanations = await explainFinancialPlan({
      financialContext: context,
      plan
    });
  } catch (error) {
    console.error(
      "Gemini explanation unavailable:",
      error.message
    );

    geminiAvailable = false;

    // Fallback explanations when Gemini is unavailable
    explanations = {
      safeToSpendExplanation:
        "Your safe-to-spend amount is based on your checking " +
        "balance, known upcoming checking-account bills, and " +
        "your selected safety cushion. Unscheduled expenses " +
        "are not included.",

      forecastExplanation:
        "This 30-day estimate carries forward your recent " +
        "average daily net flow from completed checking " +
        "transactions and subtracts known upcoming checking " +
        "bills. It assumes recent activity continues, so " +
        "one-time transactions may make the actual balance differ.",

      scenarioExplanation:
        plan.simulation.safe
          ? "Based on known upcoming bills, this purchase " +
            "keeps your projected balance above your " +
            "selected safety cushion."
          : "Based on known upcoming bills, this purchase " +
            "would cause your projected balance to fall " +
            "below your selected safety cushion."
    };
  }

  return {
    ...plan,
    explanations,
    geminiAvailable
  };
}

// GET dashboard financial plan
router.get("/dashboard", async (req, res) => {
  try {
    const customerId = req.query.customerId || DEFAULT_CUSTOMER_ID;
    const result = await buildResponse(customerId);

    res.json(result);
  } catch (error) {
    console.error(
      "Planning dashboard error:",
      error
    );

    res.status(502).json({
      error: "Financial planning unavailable"
    });
  }
});

// POST hypothetical purchase simulation
router.post("/simulate", async (req, res) => {
  try {
    const purchaseAmount = req.body.purchaseAmount;
    const buffer = req.body.buffer;
    const customerId = req.body.customerId || DEFAULT_CUSTOMER_ID;

    if (
      typeof purchaseAmount !== "number" ||
      typeof buffer !== "number" ||
      !Number.isFinite(purchaseAmount) ||
      !Number.isFinite(buffer) ||
      purchaseAmount < 0 ||
      purchaseAmount > 1000000 ||
      buffer < 0 ||
      buffer > 1000000
    ) {
      return res.status(400).json({
        error: "Invalid simulation values"
      });
    }

    const result = await buildResponse(customerId, {
      purchaseAmount,
      buffer
    });

    res.json(result);
  } catch (error) {
    console.error(
      "Simulation error:",
      error
    );

    res.status(502).json({
      error: "Simulation unavailable"
    });
  }
});

module.exports = router;
