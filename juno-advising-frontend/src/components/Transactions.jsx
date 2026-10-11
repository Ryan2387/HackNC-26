import { useEffect, useState } from "react";
import { money } from "../utils/format";
import Card from "./Card";

export default function Transactions({ full = false }) {
  const [transactions, setTransactions] = useState(null);

  useEffect(() => {
    const customerId = "3a0742d9-9abc-4c17-aa09-c42e3d482c06";

    fetch(`http://localhost:3000/api/nessie/customers/${customerId}/transactions`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to retrieve transactions");
        }
        return response.json();
      })
      .then(data => setTransactions(data))
      .catch(error => {
        console.error("Nessie transactions error:", error);
        setTransactions([]);
      });
  }, []);

  const displayedTransactions = full
    ? transactions
    : transactions?.slice(0, 5);

  return (
    <Card>
      <div className="section-heading">
        <div>
          <h3>Recent transactions</h3>
          <p>Your latest account activity</p>
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
                {t.type === "deposit" ? "💰" : "💸"}
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