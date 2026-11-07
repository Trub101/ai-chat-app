import { useEffect, useRef } from "react";

export default function ChatWindow({ messages, loading }) {
  const bottomRef = useRef(null);

  // Auto-scroll to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="messages empty">
        <h2>How can I help you today?</h2>
        <p>Type a message below to start a new conversation.</p>
      </div>
    );
  }

  return (
    <div className="messages">
      {messages.map((m) => (
        <div key={m.id} className={`bubble ${m.role}`}>
          {m.content}
        </div>
      ))}
      {loading && (
        <div className="bubble assistant thinking">
          Thinking<span>.</span><span>.</span><span>.</span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
