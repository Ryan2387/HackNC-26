import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ShieldCheck
} from "lucide-react";

import Card from "../components/Card";
import ForecastChart from "../components/ForecastChart";
import Simulator from "../components/Simulator";
import Bills from "../components/Bills";

import {
  getFinancialPlan
} from "../services/financialPlanning";

export default function Forecast({ customerId }) {
  const [financialPlan, setFinancialPlan] =
    useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setFinancialPlan(null);
    setError("");

    getFinancialPlan(customerId)
      .then(data => {
        if (active) {
          setFinancialPlan(data);
        }
      })
      .catch(err => {
        console.error("Forecast error:", err);

        if (active) {
          setError("Unable to load forecast");
        }
      });

    return () => {
      active = false;
    };
  }, [customerId]);

  return (
    <>
      <div className="welcome">
        <div>
          <div className="eyebrow">
            LOOK FORWARD
          </div>

          <h1>Your financial forecast</h1>

          <p>
            See upcoming changes and test your decisions.
          </p>
        </div>
      </div>

      <div className="main-grid">
        <Card className="forecast-card">
          <div className="section-heading">
            <div>
              <h3>30-day projection</h3>

              <p>
                Based on recent checking activity and
                known upcoming bills
              </p>
            </div>

            <span className="pill">
              Next 30 days
            </span>
          </div>

          {error ? (
            <p role="alert">{error}</p>
          ) : financialPlan === null ? (
            <p>Loading forecast...</p>
          ) : (
            <>
              <ForecastChart
                data={financialPlan.forecast}
              />

              <p className="body-copy">
                {
                  financialPlan.explanations
                    .forecastExplanation
                }
              </p>
            </>
          )}

          <div className="forecast-notes">
            <span>
              <span className="dot mint-dot" />
              Projected checking balance
            </span>

            <span>
              <AlertTriangle size={14} />
              Forecasts are estimates
            </span>
          </div>
        </Card>

        <Simulator plan={financialPlan} customerId={customerId} />
      </div>

      <div className="bottom-grid">
        <Bills customerId={customerId} />

        <Card>
          <h3>How forecasts work</h3>

          <p className="body-copy">
            Juno Advising carries forward your recent
            average daily net flow from completed
            checking transactions and subtracts known
            upcoming checking-account bills.
          </p>

          <p className="body-copy">
            Recent activity may include one-time
            transactions, so this estimate is not a
            guarantee of future income or spending.
          </p>

          <div className="hint">
            <ShieldCheck size={19} />
            Your financial calculations stay
            consistent across views.
          </div>
        </Card>
      </div>
    </>
  );
}
