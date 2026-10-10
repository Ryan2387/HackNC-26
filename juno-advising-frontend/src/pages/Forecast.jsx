import { AlertTriangle, ShieldCheck } from "lucide-react";
import Card from "../components/Card";
import ForecastChart from "../components/ForecastChart";
import Simulator from "../components/Simulator";
import Bills from "../components/Bills";

export default function Forecast() {
  return (
    <>
      <div className="welcome">
        <div>
          <div className="eyebrow">LOOK FORWARD</div>
          <h1>Your financial forecast</h1>
          <p>See upcoming changes and test your decisions.</p>
        </div>
      </div>

      <div className="main-grid">
        <Card className="forecast-card">
          <div className="section-heading">
            <div>
              <h3>30-day projection</h3>
              <p>Estimated using scheduled sample transactions</p>
            </div>
            <span className="pill">Next 30 days</span>
          </div>

          <ForecastChart />

          <div className="forecast-notes">
            <span>
              <span className="dot mint-dot" /> Estimated balance
            </span>
            <span>
              <AlertTriangle size={14} /> Forecasts are estimates
            </span>
          </div>
        </Card>

        <Simulator />
      </div>

      <div className="bottom-grid">
        <Bills />
        <Card>
          <h3>How forecasts work</h3>
          <p className="body-copy">
            Juno Advising combines your current balance with known upcoming
            bills and estimated spending. For the real application, your Express
            backend will calculate the forecast from Nessie data. Gemini can
            explain the results but should not invent numbers.
          </p>
          <div className="hint">
            <ShieldCheck size={19} /> Your financial calculations stay
            consistent across web and iMessage.
          </div>
        </Card>
      </div>
    </>
  );
}
