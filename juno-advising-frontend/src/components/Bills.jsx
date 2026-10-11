import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { money } from "../utils/format";
import Card from "./Card";

export default function Bills() {
  const [bills, setBills] = useState(null);

  useEffect(() => {
    const customerId = "3a0742d9-9abc-4c17-aa09-c42e3d482c06";

    fetch(`http://localhost:3000/api/nessie/customers/${customerId}/bills`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to retrieve bills");
        }
        return response.json();
      })
      .then(data => {
        const today = new Date().toLocaleDateString("en-CA");

        const upcomingBills = data
          .filter(bill =>
            bill.status === "pending" &&
            bill.upcoming_payment_date >= today
          )
          .sort((a, b) =>
            a.upcoming_payment_date.localeCompare(b.upcoming_payment_date)
          );

        setBills(upcomingBills);
      })
      .catch(error => {
        console.error("Nessie bills error:", error);
        setBills([]);
      });
  }, []);

  return (
    <Card>
      <div className="section-heading">
        <div>
          <h3>Upcoming bills</h3>
          <p>Keep important payments in sight</p>
        </div>
        <CalendarDays size={19} className="muted" />
      </div>

      {bills === null ? (
        <p>Loading bills...</p>
      ) : bills.length === 0 ? (
        <p>No upcoming bills found.</p>
      ) : (
        bills.map(bill => (
          <div className="bill" key={bill._id}>
            <div className="bill-icon">
              <CalendarDays size={17} />
            </div>
            <div>
              <strong>{bill.nickname || bill.payee}</strong>
              <span>
                {new Date(
                  `${bill.upcoming_payment_date}T00:00:00`
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric"
                })}
              </span>
            </div>
            <strong>{money(bill.payment_amount)}</strong>
          </div>
        ))
      )}
    </Card>
  );
}