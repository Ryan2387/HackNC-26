
const express = require("express");
const router = express.Router();

const {
  getFinancialContext
} = require("../services/financialContext");

const {
  analyzeFinances
} = require("../services/gemini");

function createHandler(defaultQuestion) {
  return async (req, res) => {
    try {
      const {
        customerId,
        userId,
        message,
        history = [],
        uiContext = {}
      } = req.body;

      if (
        typeof customerId !== "string" ||
        !customerId.trim() ||
        customerId.length > 100
      ) {
        return res.status(400).json({
          error: "Valid customerId required"
        });
      }

      if (
        userId !== undefined &&
        (!Number.isSafeInteger(Number(userId)) ||
          Number(userId) <= 0)
      ) {
        return res.status(400).json({
          error: "Invalid userId"
        });
      }

      const question = defaultQuestion ||
        (typeof message === "string"
          ? message.trim()
          : "");

      if (!question || question.length > 1000) {
        return res.status(400).json({
          error: "Invalid message"
        });
      }

      const context = await getFinancialContext(
        customerId,
        userId
      );

      const safeHistory = Array.isArray(history)
        ? history.slice(-6)
            .filter(m =>
              ["user", "assistant"].includes(m.role) &&
              typeof m.text === "string"
            )
            .map(m => ({
              role: m.role,
              text: m.text.slice(0, 1000)
            }))
        : [];

      const analysis = await analyzeFinances({
        financialContext: context,
        question,
        history: safeHistory,
        uiContext: {
          page: String(uiContext?.page || "")
            .slice(0, 50)
        }
      });

      res.json(analysis);

    } catch (error) {
      console.error("AI workflow error:", error);

      res.status(502).json({
        error: "Financial analysis unavailable"
      });
    }
  };
}

router.post("/chat", createHandler(null));

router.post(
  "/analysis",
  createHandler(
    "Analyze my financial position and provide the three most useful insights."
  )
);

module.exports = router;
