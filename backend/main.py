import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma

from app.routers import skin_scan, hormonal, users, chat

logging.basicConfig(level=logging.INFO)
db = Prisma()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    app.state.db = db
    yield
    await db.disconnect()


app = FastAPI(
    title="RituAI Backend",
    description="Smart Period Tracker + PCOS Predictor with AI Skin Scan",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://localhost:19006",
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.vercel.app",
        "https://*.expo.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(hormonal.router)
app.include_router(skin_scan.router)
app.include_router(chat.router)


@app.get("/health")
async def health():
    return {"status": "ok", "app": "RituAI"}
