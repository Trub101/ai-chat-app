from dotenv import load_dotenv

load_dotenv()  # load .env before the other modules read environment variables

import anthropic
from fastapi import FastAPI, HTTPException

import ai
import db
from schemas import ConversationOut, MessageIn, MessageOut

app = FastAPI(title="AI Chat API")


def check_exists(conversation_id: int):
    if not db.conversation_exists(conversation_id):
        raise HTTPException(status_code=404, detail="Conversation not found")


@app.get("/api/conversations", response_model=list[ConversationOut])
def list_conversations():
    return db.list_conversations()


@app.post("/api/conversations", response_model=ConversationOut, status_code=201)
def create_conversation():
    return {"id": db.create_conversation()}


@app.delete("/api/conversations/{conversation_id}", status_code=204)
def delete_conversation(conversation_id: int):
    check_exists(conversation_id)
    db.delete_conversation(conversation_id)


@app.get("/api/conversations/{conversation_id}/messages", response_model=list[MessageOut])
def get_messages(conversation_id: int):
    check_exists(conversation_id)
    return db.get_messages(conversation_id)


@app.post("/api/conversations/{conversation_id}/messages", response_model=MessageOut)
def send_message(conversation_id: int, body: MessageIn):
    check_exists(conversation_id)

    # full history + the new message, so Claude keeps the context of the chat
    history = [{"role": m["role"], "content": m["content"]} for m in db.get_messages(conversation_id)]
    history.append({"role": "user", "content": body.content})

    try:
        reply = ai.ask_claude(history)
    except anthropic.AuthenticationError:
        raise HTTPException(status_code=500, detail="The server's Anthropic API key is missing or invalid.")
    except anthropic.APIError:
        raise HTTPException(status_code=502, detail="The AI service is not available right now. Please try again.")

    # save both messages only after a successful reply, so a failed attempt leaves no half-finished turn
    db.add_message(conversation_id, "user", body.content)
    reply_id = db.add_message(conversation_id, "assistant", reply)
    return {"id": reply_id, "role": "assistant", "content": reply}
