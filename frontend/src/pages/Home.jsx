import { useEffect, useState } from "react";
import * as api from "../api.js";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import MessageInput from "../components/MessageInput.jsx";

export default function Home({ activeId, setActiveId }) {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function loadConversations() {
    api.getConversations().then(setConversations).catch((err) => setError(err.message));
  }

  // On first load: get the chat list, and reopen the chat that was open before visiting About
  useEffect(() => {
    loadConversations();
    if (activeId) openChat(activeId);
  }, []);

  function newChat() {
    setActiveId(null);
    setMessages([]);
    setError("");
  }

  async function openChat(id) {
    setError("");
    try {
      setMessages(await api.getMessages(id));
      setActiveId(id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteChat(id) {
    if (!confirm("Delete this chat?")) return;
    try {
      await api.deleteConversation(id);
      if (id === activeId) newChat();
      loadConversations();
    } catch (err) {
      setError(err.message);
    }
  }

  // Returns true on success, so the input box knows whether to keep the text
  async function handleSend(text) {
    setError("");
    setLoading(true);
    const tempId = `temp-${Date.now()}`; // shown right away, before the server answers
    setMessages((prev) => [...prev, { id: tempId, role: "user", content: text }]);
    try {
      let id = activeId;
      if (!id) {
        id = (await api.createConversation()).id; // first message starts a new conversation
        setActiveId(id);
      }
      const reply = await api.sendMessage(id, text);
      setMessages((prev) => [...prev, reply]);
      loadConversations();
      return true;
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onNew={newChat}
        onOpen={openChat}
        onDelete={deleteChat}
        disabled={loading} // switching chats mid-answer would show the reply in the wrong chat
      />
      <main className="chat">
        <ChatWindow messages={messages} loading={loading} />
        {error && <div className="error">{error}</div>}
        <MessageInput onSend={handleSend} disabled={loading} />
      </main>
    </div>
  );
}
