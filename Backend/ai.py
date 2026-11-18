import anthropic

MODEL = "claude-opus-5-5"
MAX_HISTORY = 30  # only the latest messages are sent, to keep long chats fast and cheap
SYSTEM_PROMPT = (
    "You are a helpful, friendly assistant. "
    "The chat window shows plain text, so keep formatting simple (no tables or headings)."
)

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment


def to_claude_message(message):
    """Turn one saved message into the format the Anthropic API expects."""
    if not message.get("image"):
        return {"role": message["role"], "content": message["content"]}

    # "data:image/png;base64,AAAA" -> media type "image/png" and data "AAAA"
    media_type, data = message["image"].removeprefix("data:").split(";base64,")
    content = [{"type": "image", "source": {"type": "base64", "media_type": media_type, "data": data}}]
    if message["content"]:
        content.append({"type": "text", "text": message["content"]})
    return {"role": message["role"], "content": content}


def ask_claude(history):
    """Send the conversation history to Claude and return its reply text."""
    messages = [to_claude_message(m) for m in history[-MAX_HISTORY:]]
    if messages[0]["role"] == "assistant":  # the API needs the first message to be from the user
        messages = messages[1:]

    response = client.beta.messages.create(
        model=MODEL,
        max_tokens=16000,
        system=SYSTEM_PROMPT,
        messages=messages,
        output_config={"effort": "low"},  # quick answers suit a chat
        # if the model declines a request, Anthropic retries it on a suitable fallback model
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
    )

    if response.stop_reason == "refusal":
        return "Sorry, I can't help with that request."
    text = "".join(block.text for block in response.content if block.type == "text").strip()
    # an empty reply can't be sent back to the API later, so never save one
    return text or "Sorry, I couldn't come up with an answer. Please try again."
