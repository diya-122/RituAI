from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from prisma import Prisma
from app.dependencies import get_db

router = APIRouter(prefix="/hormonal", tags=["hormonal"])


class CycleData(BaseModel):
    user_id: int
    bbt_temp: float
    lh_ratio: float


@router.post("/analyze")
async def analyze_cycle(data: CycleData, db: Prisma = Depends(get_db)):
    user = await db.user.find_unique(where={"id": data.user_id})
    if not user:
        raise HTTPException(404, "User not found")

    verdict, precautions = "Normal", "Keep tracking daily."

    if data.lh_ratio >= 1.0 and data.bbt_temp < 36.5:
        verdict = "False Surge Detected"
        precautions = "LH is high but BBT is low — likely a false surge common in PCOS. Avoid HIIT; try anti-inflammatory foods today."
    elif data.lh_ratio >= 1.0 and data.bbt_temp >= 36.6:
        verdict = "Ovulation Confirmed"
        precautions = "Temperature has risen confirming ovulation. Focus on magnesium-rich foods like ragi and spinach."

    log = await db.dailylog.create(data={
        "userId": data.user_id, "bbtTemp": data.bbt_temp,
        "lhRatio": data.lh_ratio, "verdict": verdict, "precautions": precautions,
    })

    return {"status": "success", "verdict": verdict, "advice": precautions, "log_id": log.id}
