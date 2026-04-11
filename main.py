from fastapi import FastAPI
from pydantic import BaseModel
from prisma import Prisma
from contextlib import asynccontextmanager

db = Prisma()

# This handles the database connection more reliably
@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.disconnect()

app = FastAPI(lifespan=lifespan)

class UserCreate(BaseModel):
    email: str
    name: str

class CycleData(BaseModel):
    user_id: int
    bbt_temp: float
    lh_ratio: float

@app.post("/users")
async def create_user(user: UserCreate):
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
    new_log = await db.dailylog.create(
        data={
            "userId": data.user_id,
            "bbtTemp": data.bbt_temp,
            "lhRatio": data.lh_ratio,
            "verdict": verdict,
            "precautions": precautions
        }
    )

    return {
        "status": "success",
        "verdict": verdict,
        "advice": precautions,
        "log_id": new_log.id
    }
