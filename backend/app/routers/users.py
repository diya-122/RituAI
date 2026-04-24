from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from prisma import Prisma
from app.dependencies import get_db

router = APIRouter(prefix="/users", tags=["users"])


class UserCreate(BaseModel):
    email: str
    name: Optional[str] = None
    lastPeriodStart: Optional[datetime] = None
    avgCycleLength: Optional[int] = 28


@router.post("/")
async def create_user(body: UserCreate, db: Prisma = Depends(get_db)):
    existing = await db.user.find_unique(where={"email": body.email})
    if existing:
        return existing
    return await db.user.create(data=body.model_dump(exclude_none=True))


@router.get("/{user_id}")
async def get_user(user_id: int, db: Prisma = Depends(get_db)):
    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(404, "User not found")
    return user


@router.patch("/{user_id}")
async def update_user(user_id: int, body: UserCreate, db: Prisma = Depends(get_db)):
    return await db.user.update(where={"id": user_id}, data=body.model_dump(exclude_none=True))
