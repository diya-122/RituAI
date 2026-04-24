from fastapi import APIRouter, Depends
from prisma import Prisma
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_chat import AIChatService
from app.dependencies import get_db

router = APIRouter(prefix="/chat", tags=["ai-chat"])
_chat = AIChatService()


@router.post("/", response_model=ChatResponse)
async def chat(body: ChatRequest, db: Prisma = Depends(get_db)):
    user = await db.user.find_unique(where={"id": body.user_id})
    context = f"User avg cycle length: {user.avgCycleLength} days." if user else ""
    return ChatResponse(reply=await _chat.chat(body.message, context))
