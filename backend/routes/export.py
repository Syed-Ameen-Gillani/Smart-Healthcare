"""Focused CSV exports for the Smart Health FYP workflow."""

import csv
import io
import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from database.connection import db
from utils.helpers import safe_str, serialize_date, standard_response
from utils.security import require_auth

router = APIRouter(prefix="/export", tags=["Export"])
logger = logging.getLogger(__name__)


def _validate_days(days: int) -> None:
    if days < 1 or days > 3650:
        raise HTTPException(status_code=400, detail="Days must be between 1 and 3650")


@router.get("/csv/{data_type}")
async def export_csv(request: Request, data_type: str, days: int = 90):
    """Export uploaded reports or demonstration medicine orders as CSV."""
    email = await require_auth(request)
    _validate_days(days)
    if data_type not in {"reports", "medicine_orders"}:
        raise HTTPException(status_code=400, detail=f"Unsupported data type: {data_type}")

    try:
        cutoff = datetime.utcnow() - timedelta(days=days)
        output = io.StringIO()
        writer = csv.writer(output)

        if data_type == "reports":
            writer.writerow(["Uploaded", "File Name", "Report Type", "Status", "Risk Level", "Summary", "Recommended Specialty"])
            cursor = db.files.find({"email": email, "uploaded_at": {"$gte": cutoff}}).sort("uploaded_at", -1)
            async for item in cursor:
                analysis = item.get("analysis") or {}
                specialty = analysis.get("specialty_recommendation") or {}
                writer.writerow([
                    serialize_date(item.get("uploaded_at")),
                    safe_str(item.get("original_filename") or item.get("filename")),
                    safe_str(analysis.get("report_type")),
                    safe_str(item.get("analysis_status")),
                    safe_str(analysis.get("risk_level")),
                    safe_str(analysis.get("summary")),
                    safe_str(specialty.get("specialty") if isinstance(specialty, dict) else specialty),
                ])
        else:
            writer.writerow(["Created", "Order ID", "Items", "Total", "Status", "Demo Order"])
            cursor = db.medicine_orders.find({"email": email, "created_at": {"$gte": cutoff}}).sort("created_at", -1)
            async for item in cursor:
                medicines = item.get("items") or []
                item_names = ", ".join(safe_str(med.get("name")) for med in medicines if isinstance(med, dict))
                writer.writerow([
                    serialize_date(item.get("created_at")),
                    safe_str(item.get("_id")),
                    item_names,
                    safe_str(item.get("total")),
                    safe_str(item.get("status")),
                    safe_str(item.get("is_demo", True)),
                ])

        filename = f"smart_health_{data_type}_{datetime.utcnow().strftime('%Y%m%d')}.csv"
        return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": f'attachment; filename="{filename}"'})
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("CSV export failed for %s: %s", email, exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to export data") from exc


@router.get("/summary")
async def export_summary(request: Request, days: int = 90):
    email = await require_auth(request)
    _validate_days(days)
    cutoff = datetime.utcnow() - timedelta(days=days)
    reports = await db.files.count_documents({"email": email, "uploaded_at": {"$gte": cutoff}})
    orders = await db.medicine_orders.count_documents({"email": email, "created_at": {"$gte": cutoff}})
    return standard_response(data={"period_days": days, "counts": {"reports": reports, "medicine_orders": orders}, "total_records": reports + orders})
