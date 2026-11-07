import anthropic

MODEL = "claude-opus-5-5"
MAX_HISTORY = 30  # only the latest messages are sent, to keep long chats fast and cheap
SYSTEM_PROMPT = (
    "You are a helpful, friendly assistant. "
    "The chat window shows plain text, so keep formatting simple (no tables or headings)."
)

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment


def ask_claude(history):
    """Send the conversation history to Claude and return its reply text."""
    messages = history[-MAX_HISTORY:]
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
    return "".join(block.text for block in response.content if block.type == "text")
