import { useEffect, useState } from "react";
import { money } from "../utils/format";
import Card from "./Card";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Transactions({ full = false, customerId }) {
  const [transactions, setTransactions] = useState(null);

  useEffect(() => {
    let active = true;
    setTransactions(null);

    fetch(`${API_BASE}/api/nessie/customers/${customerId}/all-transactions`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to retrieve transactions");
        }
        return response.json();
      })
      .then(data => {
        if (active) setTransactions(data);
      })
      .catch(error => {
        console.error("Combined transactions error:", error);
        if (active) setTransactions([]);
      });

    return () => {
      active = false;
    };
  }, [customerId]);

  const displayedTransactions = full
    ? transactions
    : transactions?.slice(0, 5);

  return (
    <Card>
      <div className="section-heading">
        <div>
          <h3>Recent transactions</h3>
          <p>Nessie and TigerData activity</p>
        </div>
      </div>

      <div className="transaction-list">
        {transactions === null ? (
          <p>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          displayedTransactions.map(t => (
            <div className="transaction" key={t.id}>
              <div className="merchant-icon">
                {t.amount >= 0 ? "💰" : "💸"}
              </div>

              <div className="transaction-name">
                <strong>{t.description}</strong>
                <span>
                  {t.account} ·{" "}
                  {new Date(`${t.date}T00:00:00`).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    }
                  )}
                </span>
              </div>

              <strong className={t.amount > 0 ? "green" : ""}>
                {t.amount > 0 ? "+" : ""}
                {money(t.amount)}
              </strong>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}