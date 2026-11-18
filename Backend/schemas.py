from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator

# A picture is sent as a "data URL": data:image/png;base64,iVBORw0...
IMAGE_PATTERN = r"^data:image/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$"


class MessageIn(BaseModel):
    """What the client sends: the message text, a picture, or both."""
    model_config = ConfigDict(str_strip_whitespace=True)  # "   " becomes ""
    content: str = Field(default="", max_length=10000)
    image: str | None = Field(default=None, max_length=7_000_000, pattern=IMAGE_PATTERN)  # ~5MB picture

    @model_validator(mode="after")
    def not_empty(self):
        if not self.content and not self.image:
            raise ValueError("Send a message or a picture")
        return self


class MessageOut(BaseModel):
    id: int
    role: Literal["user", "assistant"]
    content: str
    image: str | None = None


class ConversationOut(BaseModel):
    id: int
    title: str | None = None
    created_at: datetime | None = None
