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

export default function Overview({ go }) {
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
          value={money(DEMO.balance)}
          detail="Across your linked demo accounts"
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
          value={money(DEMO.income)}
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
