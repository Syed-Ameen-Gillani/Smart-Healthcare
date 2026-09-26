"""FYP-only demonstration medicine catalog and ordering routes."""

from datetime import datetime
import logging
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query, Request

from config.settings import ADMIN_EMAIL
from database.connection import db
from database.models import MedicineOrderCreate
from utils.helpers import serialize_doc, standard_response
from utils.security import require_auth

router = APIRouter(tags=["Demo Medicine Orders"])
logger = logging.getLogger(__name__)

DEMO_MEDICINES = [
    {"name": "Demo Paracetamol", "generic_name": "Paracetamol", "category": "Pain relief", "price": 120, "requires_prescription": False},
    {"name": "Demo Vitamin D", "generic_name": "Cholecalciferol", "category": "Supplements", "price": 220, "requires_prescription": False},
    {"name": "Demo Iron Tablets", "generic_name": "Ferrous sulfate", "category": "Supplements", "price": 180, "requires_prescription": True},
    {"name": "Demo Glucose Support", "generic_name": "Educational item", "category": "Endocrine care", "price": 250, "requires_prescription": True},
    {"name": "Demo Heart Care", "generic_name": "Educational item", "category": "Cardiac care", "price": 300, "requires_prescription": True},
    {"name": "Demo ORS", "generic_name": "Oral rehydration salts", "category": "Hydration", "price": 80, "requires_prescription": False},
    {"name": "Demo Antacid", "generic_name": "Calcium carbonate", "category": "Digestive care", "price": 110, "requires_prescription": False},
    {"name": "Demo Multivitamin", "generic_name": "Multivitamin", "category": "Supplements", "price": 200, "requires_prescription": False},
]


async def ensure_demo_catalog() -> int:
    """Idempotently create the small fictional catalog used by the FYP demo."""
    created = 0
    for item in DEMO_MEDICINES:
        result = await db.medicine_catalog.update_one(
            {"name": item["name"], "is_demo": True},
            {"$set": {
                **item,
                "active": True,
                "is_demo": True,
                "description": "Fictional item for the Smart Health FYP demonstration.",
            }},
            upsert=True,
        )
        created += int(result.upserted_id is not None)
    return created


@router.get("/medicine-catalog")
async def list_catalog(request: Request, search: Optional[str] = Query(None, max_length=100)):
    await require_auth(request)
    await ensure_demo_catalog()
    query = {"active": True, "is_demo": True}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"generic_name": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
        ]
    items = [serialize_doc(item) async for item in db.medicine_catalog.find(query).sort("name", 1)]
    logger.info("Demo medicine catalog retrieved: item_count=%d filtered=%s", len(items), bool(search))
    return standard_response(message="Demo catalog retrieved", data={"medicines": items})


@router.post("/medicine-catalog/seed")
async def seed_catalog(request: Request):
    email = await require_auth(request)
    if not ADMIN_EMAIL or email.lower() != ADMIN_EMAIL.lower():
        raise HTTPException(status_code=403, detail="Admin access required")
    created = await ensure_demo_catalog()
    logger.info("Demo medicine catalog seeded: created=%d total=%d", created, len(DEMO_MEDICINES))
    return standard_response(message="Demo catalog ready", data={"created": created, "total": len(DEMO_MEDICINES)})


@router.post("/medicine-orders")
async def create_order(request: Request, order: MedicineOrderCreate):
    email = await require_auth(request)
    ids = []
    for item in order.items:
        if not ObjectId.is_valid(item.medicine_id):
            raise HTTPException(status_code=400, detail="Invalid medicine ID")
        ids.append(ObjectId(item.medicine_id))

    catalog = await db.medicine_catalog.find({"_id": {"$in": ids}, "active": True, "is_demo": True}).to_list(20)
    by_id = {str(item["_id"]): item for item in catalog}
    if len(by_id) != len(set(str(value) for value in ids)):
        raise HTTPException(status_code=400, detail="One or more medicines are unavailable")

    report = None
    if order.report_id:
        if not ObjectId.is_valid(order.report_id):
            raise HTTPException(status_code=400, detail="Invalid report ID")
        report = await db.files.find_one({"_id": ObjectId(order.report_id), "email": email})
        if not report:
            raise HTTPException(status_code=400, detail="Report not found")

    resolved = []
    total = 0
    requires_prescription = False
    for requested in order.items:
        medicine = by_id[requested.medicine_id]
        subtotal = medicine["price"] * requested.quantity
        total += subtotal
        requires_prescription = requires_prescription or medicine.get("requires_prescription", False)
        resolved.append({"medicine_id": requested.medicine_id, "name": medicine["name"], "quantity": requested.quantity, "unit_price": medicine["price"], "subtotal": subtotal})
    if requires_prescription and not report:
        raise HTTPException(status_code=400, detail="Select an uploaded report for prescription-required demo items")

    now = datetime.utcnow()
    document = {
        "email": email, "items": resolved, "report_id": order.report_id,
        "report_name": report.get("filename") if report else None,
        "delivery_name": order.delivery_name, "delivery_phone": order.delivery_phone,
        "delivery_address": order.delivery_address, "total": total,
        "status": "Pending", "is_demo": True, "created_at": now, "updated_at": now,
    }
    result = await db.medicine_orders.insert_one(document)
    document["_id"] = str(result.inserted_id)
    logger.info(
        "Demo medicine order submitted: item_count=%d prescription_required=%s",
        len(resolved),
        requires_prescription,
    )
    return standard_response(message="Demo order submitted", data={"order": serialize_doc(document)})


@router.get("/medicine-orders")
async def list_orders(request: Request):
    email = await require_auth(request)
    orders = [serialize_doc(item) async for item in db.medicine_orders.find({"email": email}).sort("created_at", -1).limit(100)]
    logger.info("Demo medicine order history retrieved: order_count=%d", len(orders))
    return standard_response(message="Orders retrieved", data={"orders": orders})


@router.get("/medicine-orders/{order_id}")
async def get_order(request: Request, order_id: str):
    email = await require_auth(request)
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    order = await db.medicine_orders.find_one({"_id": ObjectId(order_id), "email": email})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    logger.info("Demo medicine order retrieved")
    return standard_response(message="Order retrieved", data={"order": serialize_doc(order)})
