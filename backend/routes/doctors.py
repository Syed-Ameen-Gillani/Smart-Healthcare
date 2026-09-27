"""Focused fictional doctor directory for the Smart Health FYP."""

import logging
import re
from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query, Request

from config.settings import ADMIN_EMAIL
from database.connection import db
from database.models import DoctorCreate
from utils.helpers import serialize_doc, standard_response
from utils.security import require_auth

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/doctors", tags=["Doctors"])

DEMO_DOCTORS = [
    ("Dr. Ayesha Noor", "General Medicine", "Muzaffarabad"),
    ("Dr. Hamza Ali", "Cardiology", "Muzaffarabad"),
    ("Dr. Sara Khan", "Endocrinology", "Muzaffarabad"),
    ("Dr. Bilal Ahmed", "Hematology", "Islamabad"),
    ("Dr. Mehwish Iqbal", "Gastroenterology", "Islamabad"),
    ("Dr. Usman Raza", "Nephrology", "Rawalpindi"),
    ("Dr. Hira Malik", "Pulmonology", "Rawalpindi"),
    ("Dr. Zain Abbas", "Neurology", "Islamabad"),
]


@router.post("")
async def add_doctor(request: Request, doctor: DoctorCreate):
    email = await require_auth(request)
    if not ADMIN_EMAIL or email.lower() != ADMIN_EMAIL.lower():
        raise HTTPException(status_code=403, detail="Admin access required")
    document = {**doctor.dict(), "active": True, "is_demo": True, "created_at": datetime.utcnow()}
    result = await db.doctors.insert_one(document)
    return standard_response(message="Doctor added", data={"doctor_id": str(result.inserted_id)})


@router.get("")
async def list_doctors(
    specialization: Optional[str] = Query(None), city: Optional[str] = Query(None),
    search: Optional[str] = Query(None), sort_by: str = Query("name", pattern="^(name|specialization|city)$"),
    limit: int = Query(50, ge=1, le=200), skip: int = Query(0, ge=0),
):
    query = {"active": True}
    if specialization:
        query["specialization"] = {"$regex": re.escape(specialization), "$options": "i"}
    if city:
        query["city"] = {"$regex": re.escape(city), "$options": "i"}
    if search:
        query["name"] = {"$regex": re.escape(search), "$options": "i"}
    doctors = await db.doctors.find(query).sort(sort_by, 1).skip(skip).limit(limit).to_list(limit)
    return standard_response(message="Doctors retrieved", data={
        "doctors": [serialize_doc(item) for item in doctors],
        "total": await db.doctors.count_documents(query), "limit": limit, "skip": skip,
    })


@router.get("/specializations")
async def get_specializations():
    values = await db.doctors.distinct("specialization", {"active": True})
    return standard_response(message="Specializations retrieved", data={"specializations": sorted(values)})


@router.get("/cities")
async def get_cities():
    values = await db.doctors.distinct("city", {"active": True})
    return standard_response(message="Cities retrieved", data={"cities": sorted(values)})


@router.post("/seed")
async def seed_doctors(request: Request):
    email = await require_auth(request)
    if not ADMIN_EMAIL or email.lower() != ADMIN_EMAIL.lower():
        raise HTTPException(status_code=403, detail="Admin access required")
    created = 0
    for name, specialty, city in DEMO_DOCTORS:
        result = await db.doctors.update_one(
            {"name": name, "is_demo": True},
            {"$set": {"name": name, "specialization": specialty, "city": city,
                "location": f"Demo Medical Centre, {city}", "experience_years": 8,
                "qualification": "MBBS, FCPS", "consultation_fee": 1500,
                "available_days": ["Monday", "Wednesday", "Friday"],
                "bio": "Fictional doctor record for the Smart Health academic demonstration.",
                "phone": "000-0000000", "active": True, "is_demo": True}},
            upsert=True,
        )
        created += int(result.upserted_id is not None)
    logger.info("Demo doctors seeded: created=%d total=%d", created, len(DEMO_DOCTORS))
    return standard_response(message="Demo doctors ready", data={"created": created, "total": len(DEMO_DOCTORS)})


@router.get("/{doctor_id}")
async def get_doctor(doctor_id: str):
    if not ObjectId.is_valid(doctor_id):
        raise HTTPException(status_code=400, detail="Invalid doctor ID")
    doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id), "active": True})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return standard_response(message="Doctor retrieved", data={"doctor": serialize_doc(doctor)})
