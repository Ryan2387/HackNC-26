import { useState } from "react";
import { Sparkles, Send, ChevronRight, ShieldCheck } from "lucide-react";
import Card from "../components/Card";

const suggestedQuestions = [
  "Can I afford a $300 purchase?",
  "What bills are coming up?",
  "How much can I safely spend?",
  "Where is my money going?",
];

export default function Copilot({ customer }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Hey ${customer.first_name}! I'm Juno Advising, your financial copilot. Ask me about your spending, upcoming bills, or whether a purchase fits your budget.`,
    },
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(message = draft) {
    const text = message.trim();
    if (!text || loading) return;

    setMessages((current) => [...current, { role: "user", text }]);
    setDraft("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          customerId: customer._id,
          history: messages.slice(-6),
          uiContext: {
          page: "copilot"
  }
}),
      });

      if (!res.ok) throw new Error("Backend not connected");

      const data = await res.json();
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: data.reply || data.message || "No response returned.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: `Live financial analysis for ${customer.first_name} is unavailable right now. Please try again later.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="welcome">
        <div>
          <div className="eyebrow">YOUR MONEY, MADE CLEAR</div>
          <h1>
            Meet your financial copilot <span className="wave">✳</span>
          </h1>
          <p>Ask a question. Make a more informed decision.</p>
        </div>
      </div>

      <div className="chat-layout">
        <Card className="chat-card">
          <div className="chat-head">
            <div className="bot-avatar">
              <Sparkles size={22} />
            </div>
            <div>
              <strong>Juno Advising AI</strong>
              <span>Financial copilot · Demo mode</span>
            </div>
            <span className="online-dot" />
          </div>

          <div className="chat-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div className={"bubble " + message.role} key={index}>
                {message.role === "assistant" && <Sparkles size={16} />}
                <span>{message.text}</span>
              </div>
            ))}
            {loading && <div className="bubble assistant">Thinking…</div>}
          </div>

          <form
            className="chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <input
              aria-label="Ask Juno Advising"
              placeholder="Ask about your finances…"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button
              type="submit"
              disabled={!draft.trim() || loading}
              aria-label="Send message"
            >
              <Send size={19} />
            </button>
          </form>
        </Card>

        <div className="prompt-panel">
          <h3>Try asking</h3>
          <p>Explore what Juno Advising could help with.</p>

          {suggestedQuestions.map((question) => (
            <button
              className="prompt"
              key={question}
              onClick={() => send(question)}
            >
              <Sparkles size={16} />
              {question}
              <ChevronRight size={15} />
            </button>
          ))}

          <div className="hint">
            <ShieldCheck size={19} /> Juno Advising provides educational
            estimates, not professional financial advice.
          </div>
        </div>
      </div>
    </>
  );
}
