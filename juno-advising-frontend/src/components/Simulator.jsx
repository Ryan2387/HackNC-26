import { useState } from "react";
import {
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

import { money } from "../utils/format";
import { simulatePurchase } from "../services/financialPlanning";
import Card from "./Card";

export default function Simulator({ plan, customerId }) {
  const [amount, setAmount] = useState(250);
  const [buffer, setBuffer] = useState(500);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const maxPurchaseAmount = Math.max(
    1200,
    Math.ceil(Number(plan?.startingBalance || 0) / 500) * 500
  );

  async function handleSimulation() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await simulatePurchase(
        amount,
        buffer,
        customerId
      );

      setResult(response);
    } catch (err) {
      console.error("Simulation error:", err);
      setError("Could not analyze this purchase.");
    } finally {
      setLoading(false);
    }
  }

  const simulation = result?.simulation;

  return (
    <Card className="sim-card">
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            WHAT-IF SIMULATOR
          </div>
          <h3>Can I afford this?</h3>
          <p>
            See how a purchase changes your future
            balance.
          </p>
        </div>

        <span className="icon-tile mint">
          <SlidersHorizontal size={19} />
        </span>
      </div>

      <div className="field-label">
        <label htmlFor="amount">
          Purchase amount
        </label>
        <strong>{money(amount)}</strong>
      </div>

      <input
        id="amount"
        type="range"
        min="0"
        max={maxPurchaseAmount}
        step="25"
        value={amount}
        onChange={event => {
          setAmount(Number(event.target.value));
          setResult(null);
        }}
      />

      <div className="range-ends">
        <span>$0</span>
        <span>{money(maxPurchaseAmount)}</span>
      </div>

      <div className="field-label">
        <label htmlFor="buffer">
          Minimum safety cushion
        </label>
        <strong>{money(buffer)}</strong>
      </div>

      <input
        id="buffer"
        type="range"
        min="0"
        max="1000"
        step="50"
        value={buffer}
        onChange={event => {
          setBuffer(Number(event.target.value));
          setResult(null);
        }}
      />

      <button
        type="button"
        className="primary-button"
        onClick={handleSimulation}
        disabled={loading || !plan}
      >
        {loading ? "Analyzing..." : "Analyze purchase"}
      </button>

      {error && (
        <p role="alert" className="muted">
          {error}
        </p>
      )}

      {simulation && (
        <div className="sim-result">
          <div
            className={
              "status-icon " +
              (simulation.safe ? "safe" : "risk")
            }
          >
            {simulation.safe ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertTriangle size={20} />
            )}
          </div>

          <div>
            <strong>
              {simulation.safe
                ? "Looks manageable"
                : "Consider waiting"}
            </strong>

            <p>
              Lowest projected balance:{" "}
              <b>
                {money(simulation.lowestBalance)}
              </b>
            </p>

            <p>
              {
                result.explanations
                  .scenarioExplanation
              }
            </p>
          </div>
        </div>
      )}

      <small className="muted">
        Recent checking cash flow and known bills are
        carried forward as an estimate; actual activity
        may differ.
      </small>
    </Card>
  );
}
