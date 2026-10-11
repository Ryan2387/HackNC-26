import {
  Sparkles,
  Wallet,
  ShieldCheck,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";

import { money } from "../utils/format";
import Card from "../components/Card";
import Stat from "../components/Stat";
import ForecastChart from "../components/ForecastChart";
import Simulator from "../components/Simulator";
import Transactions from "../components/Transactions";
import Bills from "../components/Bills";

import { useEffect, useState } from "react";
import { getFinancialPlan } from "../services/financialPlanning";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Overview({ go, customer }) {
  const [checkingBalance, setCheckingBalance] = useState(null);
  const [monthlyIncome, setMonthlyIncome] = useState(null);
  const [monthlySpending, setMonthlySpending] = useState(null);
  const [financialPlan, setFinancialPlan] = useState(null);
  const [planningError, setPlanningError] = useState("");

  useEffect(() => {
    let active = true;
    setCheckingBalance(null);
    setMonthlyIncome(null);
    setMonthlySpending(null);

    fetch(
      `${API_BASE}/api/nessie/customers/${customer._id}/checking-balance`
    )
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to retrieve checking balance");
        }
        return response.json();
      })
      .then(data => {
        if (active) {
          setCheckingBalance(data.balance);
        }
      })
      .catch(error => {
        console.error("Checking balance error:", error);
      });

    fetch(
      `${API_BASE}/api/nessie/customers/${customer._id}/monthly-income`
    )
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to retrieve monthly income");
        }
        return response.json();
      })
      .then(data => {
        if (active) {
          setMonthlyIncome(data.monthlyIncome);
        }
      })
      .catch(error => {
        console.error("Monthly income error:", error);
      });

    fetch(
      `${API_BASE}/api/nessie/customers/${customer._id}/monthly-spending`
    )
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to retrieve monthly spending");
        }
        return response.json();
      })
      .then(data => {
        if (active) {
          setMonthlySpending(data.monthlySpending);
        }
      })
      .catch(error => {
        console.error("Monthly spending error:", error);
      });

    return () => {
      active = false;
    };
  }, [customer._id]);

  useEffect(() => {
    let active = true;
    setFinancialPlan(null);
    setPlanningError("");

    getFinancialPlan(customer._id)
      .then(data => {
        if (active) {
          setFinancialPlan(data);
        }
      })
      .catch(error => {
        console.error("Financial plan error:", error);

        if (active) {
          setPlanningError("Planning data unavailable");
        }
      });

    return () => {
      active = false;
    };
  }, [customer._id]);

  return (
    <>
      <div className="welcome">
        <div>
          <div className="eyebrow">
            SATURDAY, OCTOBER 10, 2026
          </div>

          <h1>
            Good afternoon, {customer.first_name}{" "}
            <span className="wave">✳</span>
          </h1>

          <p>
            Here's where your money stands — and where
            it's headed.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => go("copilot")}
        >
          <Sparkles size={17} />
          Ask Juno Advising
        </button>
      </div>

      <div className="stats-grid">
        <Stat
          label="Total balance"
          value={
            checkingBalance === null
              ? "Loading..."
              : money(checkingBalance)
          }
          detail="Primary checking account"
          icon={Wallet}
        />

        <Stat
          label="Safe to spend"
          value={
            financialPlan
              ? money(financialPlan.safeToSpend)
              : planningError || "Loading..."
          }
          detail="After known bills and $500 safety cushion"
          icon={ShieldCheck}
          positive
        />

        <Stat
          label="Monthly income"
          value={
            monthlyIncome === null
              ? "Loading..."
              : money(monthlyIncome)
          }
          detail="Deposits received this month"
          icon={ArrowDownRight}
          positive
        />

        <Stat
          label="Monthly spending"
          value={
            monthlySpending === null
              ? "Loading..."
              : money(monthlySpending)
          }
          detail="Spent so far this month"
          icon={ArrowUpRight}
        />
      </div>

      <div className="main-grid">
        <Card className="forecast-card">
          <div className="section-heading">
            <div>
              <h3>Balance forecast</h3>
              <p>
                Where your money could be over
                the next 30 days
              </p>
            </div>

            <button
              className="text-button"
              onClick={() => go("forecast")}
            >
              Explore
              <ChevronRight size={16} />
            </button>
          </div>

          {planningError ? (
            <p role="alert">{planningError}</p>
          ) : financialPlan === null ? (
            <p>Loading forecast...</p>
          ) : (
            <ForecastChart
              data={financialPlan.forecast}
            />
          )}

          {financialPlan?.explanations && (
            <p className="body-copy">
              {
                financialPlan.explanations
                  .forecastExplanation
              }
            </p>
          )}
        </Card>

        <Simulator plan={financialPlan} />
      </div>

      <div className="bottom-grid">
        <Transactions customerId={customer._id} />
        <Bills customerId={customer._id} />
      </div>
    </>
  );
}
