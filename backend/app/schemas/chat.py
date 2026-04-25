from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    user_id: int
    message: str
    context: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
