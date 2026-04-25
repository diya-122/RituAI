"""Gemini Flash — free tier, 1500 req/day, no credit card needed."""
import logging
import google.generativeai as genai
from app.config import get_settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are RituAI's health assistant — warm and knowledgeable for women managing PCOS and irregular cycles.
Explain hormonal patterns, cycle data, and skin changes in simple non-alarming language.
Be India-aware: reference dal, ragi, paneer, yoga when relevant.
Never diagnose. Always recommend consulting a gynecologist for medical decisions.
Keep responses concise and supportive — max 3 short paragraphs."""


class AIChatService:
    def __init__(self):
        genai.configure(api_key=get_settings().GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=SYSTEM_PROMPT)

    async def chat(self, message: str, context: str = "") -> str:
        try:
            prompt = f"{context}\n\nUser: {message}".strip() if context else message
            return self.model.generate_content(prompt).text
        except Exception as e:
            logger.error(f"Gemini error: {e}")
            return "I'm having trouble connecting right now. Please try again in a moment."
