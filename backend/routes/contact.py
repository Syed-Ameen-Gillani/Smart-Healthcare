"""Public contact form route."""

import logging
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, HTTPException

from database.connection import db
from database.models import ContactRequest
from services.email_service import send_contact_confirmation
from utils.helpers import standard_response

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("")
async def submit_contact(contact: ContactRequest, background_tasks: BackgroundTasks):
    try:
        document = contact.dict()
        document.update({"submitted_at": datetime.utcnow(), "status": "new"})
        result = await db.contacts.insert_one(document)
        background_tasks.add_task(send_contact_confirmation, contact.email, contact.name)
        return standard_response(message="Thank you. Your message has been received.", data={"contact_id": str(result.inserted_id)})
    except Exception as exc:
        logger.error("Contact submission failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to submit contact form") from exc
