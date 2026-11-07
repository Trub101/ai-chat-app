// All calls to the backend live here. The API key is never in the browser.

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    // FastAPI sends a string for our errors and a list for validation errors
    throw new Error(typeof data.detail === "string" ? data.detail : "Something went wrong. Please try again.");
  }
  return res.status === 204 ? null : res.json();
}

export const getConversations = () => request("/conversations");

export const createConversation = () => request("/conversations", { method: "POST" });

export const deleteConversation = (id) => request(`/conversations/${id}`, { method: "DELETE" });

export const getMessages = (id) => request(`/conversations/${id}/messages`);

export const sendMessage = (id, content) =>
  request(`/conversations/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
