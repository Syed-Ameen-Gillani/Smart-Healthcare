"""Gemini chat routes used by the focused Smart Health FYP."""

from datetime import datetime
import logging

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from database.connection import db
from database.models import ChatRequest
from services.gemini_service import gemini_chat_stream, gemini_health_chat, is_gemini_available
from utils.helpers import standard_response
from utils.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/gemini", tags=["Gemini AI"])


@router.post("/chat")
async def health_chatbot(chat: ChatRequest, request: Request):
    if not is_gemini_available():
        raise HTTPException(status_code=503, detail="Gemini unavailable")
    try:
        context = chat.context or {}
        email = await get_current_user(request)
        if email:
            user = await db.store.find_one({"email": email})
            if user:
                context["user_age"] = user.get("age")
                context["user_gender"] = user.get("gender")

        logger.info(
            "Gemini chat requested: authenticated=%s context_keys=%d message_length=%d",
            bool(email), len(context), len(chat.message),
        )
        response_text = await gemini_health_chat(chat.message, context)
        if email:
            try:
                await db.chat_history.insert_one({
                    "email": email, "message": chat.message,
                    "response": response_text, "created_at": datetime.utcnow(),
                })
            except Exception:
                logger.warning("Gemini chat history was not saved", exc_info=True)

        logger.info("Gemini chat response generated: response_length=%d", len(response_text))
        return standard_response(
            message="Chat response generated",
            data={"response": response_text, "timestamp": datetime.utcnow().isoformat()},
        )
    except Exception:
        logger.exception("Gemini chat failed")
        raise HTTPException(status_code=500, detail="Chat failed")


@router.post("/chat/stream")
async def health_chatbot_stream(chat: ChatRequest, request: Request):
    if not is_gemini_available():
        raise HTTPException(status_code=503, detail="Gemini unavailable")
    context = chat.context or {}
    email = await get_current_user(request)
    if email:
        user = await db.store.find_one({"email": email})
        if user:
            context["user_age"] = user.get("age")

    async def generate():
        async for chunk in gemini_chat_stream(chat.message, context):
            yield chunk

    return StreamingResponse(generate(), media_type="text/plain")


@router.get("/status")
async def gemini_status():
    available = is_gemini_available()
    logger.info("Gemini status requested: available=%s", available)
    return standard_response(
        message="Gemini AI status",
        data={
            "enabled": available,
            "sdk_version": "2026 (google-genai)",
            "model": "gemini-3.5-flash-lite",
            "features": {"chat": available, "streaming": available, "report_analysis": available},
        },
    )
