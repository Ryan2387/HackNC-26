import {
  Sparkles,
  Wallet,
  ShieldCheck,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { DEMO } from "../data/demo";
import { money } from "../utils/format";
import Card from "../components/Card";
import Stat from "../components/Stat";
import ForecastChart from "../components/ForecastChart";
import Simulator from "../components/Simulator";
import Transactions from "../components/Transactions";
import Bills from "../components/Bills";
import { useEffect, useState } from "react";

export default function Overview({ go }) {
  const [checkingBalance, setCheckingBalance] = useState(null);
  const [monthlyIncome, setMonthlyIncome] = useState(null);

  useEffect(() => {
    const customerId = "3a0742d9-9abc-4c17-aa09-c42e3d482c06";

    fetch(`http://localhost:3000/api/nessie/customers/${customerId}/checking-balance`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to retrieve checking balance");
        }
        return response.json();
      })
      .then(data => setCheckingBalance(data.balance))
      .catch(error => console.error("Checking balance error:", error));

      fetch(`http://localhost:3000/api/nessie/customers/${customerId}/monthly-income`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to retrieve monthly income");
        }
        return response.json();
      })
      .then(data => setMonthlyIncome(data.monthlyIncome))
      .catch(error => console.error("Monthly income error:", error));
  }, []);

  return (
    <>
      <div className="welcome">
        <div>
          <div className="eyebrow">SATURDAY, OCTOBER 10, 2026</div>
          <h1>
            Good afternoon, {DEMO.name} <span className="wave">✳</span>
          </h1>
          <p>Here's where your money stands — and where it's headed.</p>
        </div>
        <button className="primary-button" onClick={() => go("copilot")}>
          <Sparkles size={17} /> Ask Juno Advising
        </button>
      </div>

      <div className="stats-grid">
        <Stat
          label="Total balance"
          value={checkingBalance === null ? "Loading..." : money(checkingBalance)}
          detail="Primary checking account"
          icon={Wallet}
        />
        <Stat
          label="Safe to spend"
          value={money(DEMO.safeToSpend)}
          detail="After planned expenses"
          icon={ShieldCheck}
          positive
        />
        <Stat
          label="Monthly income"
          value={monthlyIncome === null ? "Loading..." : money(monthlyIncome)}
          detail="Estimated this month"
          icon={ArrowDownRight}
          positive
        />
        <Stat
          label="Monthly spending"
          value={money(DEMO.spent)}
          detail="Spent so far this month"
          icon={ArrowUpRight}
        />
      </div>

      <div className="main-grid">
        <Card className="forecast-card">
          <div className="section-heading">
            <div>
              <h3>Balance forecast</h3>
              <p>Where your money could be over the next 30 days</p>
            </div>
            <button className="text-button" onClick={() => go("forecast")}>
              Explore <ChevronRight size={16} />
            </button>
          </div>
          <ForecastChart />
        </Card>
        <Simulator />
      </div>

      <div className="bottom-grid">
        <Transactions />
        <Bills />
      </div>
    </>
  );
}
