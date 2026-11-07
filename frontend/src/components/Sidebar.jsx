export default function Sidebar({ conversations, activeId, onNew, onOpen, onDelete }) {
  return (
    <aside className="sidebar">
      <button className="new-chat" onClick={onNew}>+ New chat</button>
      <p className="sidebar-title">Previous chats</p>
      <ul>
        {conversations.length === 0 && <li className="muted">No chats yet</li>}
        {conversations.map((c) => (
          <li key={c.id} className={c.id === activeId ? "active" : ""} onClick={() => onOpen(c.id)}>
            <span className="chat-title">{c.title}</span>
            <button
              className="delete"
              title="Delete chat"
              onClick={(e) => {
                e.stopPropagation(); // don't also open the chat
                onDelete(c.id);
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
