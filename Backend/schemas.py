from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class MessageIn(BaseModel):
    """What the client sends: the user's message text."""
    model_config = ConfigDict(str_strip_whitespace=True)  # "   " becomes "" and fails min_length
    content: str = Field(min_length=1, max_length=10000)


class MessageOut(BaseModel):
    id: int
    role: Literal["user", "assistant"]
    content: str


class ConversationOut(BaseModel):
    id: int
    title: str | None = None
    created_at: datetime | None = None
