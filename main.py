from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import os
from google import genai
from dotenv import load_dotenv
from typing import List

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
gemini_client = (
    genai.Client(api_key=GEMINI_API_KEY)
    if GEMINI_API_KEY and GEMINI_API_KEY != "PASTE_YOUR_API_KEY_HERE"
    else None
)

try:
    from prisma import Prisma
    db = Prisma()
    HAS_DB = True
except (ImportError, RuntimeError):
    db = None
    HAS_DB = False
    print("Warning: Prisma client not generated or installed. Database endpoints will use mock data.")

# This handles the database connection more reliably
@asynccontextmanager
async def lifespan(app: FastAPI):
    if HAS_DB:
        try:
            await db.connect()
        except Exception as e:
            print(f"Failed to connect to DB: {e}")
    yield
    if HAS_DB:
        try:
            await db.disconnect()
        except Exception:
            pass

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "gemini_configured": bool(GEMINI_API_KEY and GEMINI_API_KEY != "PASTE_YOUR_API_KEY_HERE"),
        "gemini_model": GEMINI_MODEL,
    }

class UserCreate(BaseModel):
    email: str
    name: str

class CycleData(BaseModel):
    user_id: int
    bbt_temp: float
    lh_ratio: float

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@app.post("/users")
async def create_user(user: UserCreate):
    if not HAS_DB:
        return {"id": 1, "email": user.email, "name": user.name}
    return await db.user.create(
        data={
            "email": user.email,
            "name": user.name
        }
    )

@app.post("/analyze")
async def analyze_cycle(data: CycleData):
    # Default state
    verdict = "Normal"
    precautions = "Keep tracking daily."

    # Logic Gate
    if data.lh_ratio >= 1.0 and data.bbt_temp < 36.5:
        verdict = "False Surge Detected"
        precautions = "LH is high but Temp is low. Avoid HIIT; try anti-inflammatory foods today."
    elif data.lh_ratio >= 1.0 and data.bbt_temp >= 36.6:
        verdict = "Ovulation Confirmed"
        precautions = "Your temp has risen! Focus on magnesium-rich foods."

    # Save to Supabase
    if HAS_DB:
        new_log = await db.dailylog.create(
            data={
                "userId": data.user_id,
                "bbtTemp": data.bbt_temp,
                "lhRatio": data.lh_ratio,
                "verdict": verdict,
                "precautions": precautions
            }
        )
        log_id = new_log.id
    else:
        log_id = 1

    return {
        "status": "success",
        "verdict": verdict,
        "advice": precautions,
        "log_id": log_id
    }

@app.post("/chat")
async def chat_with_saheli(req: ChatRequest):
    if not gemini_client:
        return {"status": "error", "message": "Gemini API key is not configured on the server."}
        
    try:
        system_prompt = (
            "You are Saheli, a supportive, empathetic, and knowledgeable Indian AI assistant for women's hormonal and skin health. "
            "You specialize in tracking cycles, managing PCOS symptoms, and offering gentle wellness advice. "
            "Respond concisely and warmly in a conversational tone, occasionally incorporating Indian cultural context or dietary references when relevant. Keep your responses to 1-3 short sentences. "
            "Never introduce yourself as an AI."
        )

        transcript = "\n".join(
            f"{'User' if msg.role == 'user' else 'Saheli'}: {msg.content}"
            for msg in req.messages
        )
        prompt = f"{system_prompt}\n\nConversation:\n{transcript}\n\nSaheli:"

        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )
        
        return {
            "status": "success",
            "reply": response.text
        }
    except Exception as e:
        error_text = str(e)
        if "429" in error_text or "quota" in error_text.lower():
            return {
                "status": "error",
                "message": "Gemini quota is exhausted or billing is not enabled for this API key. Check Google AI Studio billing/quota or use another key.",
            }
        return {"status": "error", "message": error_text}
