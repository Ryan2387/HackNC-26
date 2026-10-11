import Transactions from "../components/Transactions";
import Spending from "../components/Spending";

export default function Activity({ customerId }) {
  return (
    <>
      <div className="welcome">
        <div>
          <div className="eyebrow">FOLLOW YOUR FLOW</div>
          <h1>Spending & transactions</h1>
          <p>Understand the habits behind your financial future.</p>
        </div>
      </div>

      <div className="bottom-grid">
        <Transactions full customerId={customerId} />
        <Spending customerId={customerId} />
      </div>
    </>
  );
}
