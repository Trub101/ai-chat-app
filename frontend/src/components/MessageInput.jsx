import { useState } from "react";

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  async function submit() {
    const message = text.trim();
    if (!message || disabled) return;
    setText("");
    const ok = await onSend(message);
    if (!ok) setText(message); // give the text back so the user can retry
  }

  // Enter sends, Shift+Enter adds a new line
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="input-bar">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message the AI... (Shift+Enter for a new line)"
        maxLength={10000}
        rows={1}
      />
      <button onClick={submit} disabled={disabled || !text.trim()}>Send</button>
    </div>
  );
}
