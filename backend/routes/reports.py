"""PDF summary for the focused Smart Health demonstration flow."""

import io
import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from database.connection import db, get_user_by_email
from utils.helpers import safe_str, standard_response
from utils.security import require_auth

router = APIRouter(prefix="/reports", tags=["Reports"])
logger = logging.getLogger(__name__)


def _validate_days(days: int) -> None:
    if days < 1 or days > 3650:
        raise HTTPException(status_code=400, detail="Days must be between 1 and 3650")


async def _load_data(email: str, days: int):
    cutoff = datetime.utcnow() - timedelta(days=days)
    profile = await get_user_by_email(email) or {}
    reports = await db.files.find({"email": email, "uploaded_at": {"$gte": cutoff}}).sort("uploaded_at", -1).limit(50).to_list(length=50)
    orders = await db.medicine_orders.find({"email": email, "created_at": {"$gte": cutoff}}).sort("created_at", -1).limit(50).to_list(length=50)
    return profile, reports, orders


@router.get("/summary")
async def report_summary(request: Request, days: int = 90):
    email = await require_auth(request)
    _validate_days(days)
    profile, reports, orders = await _load_data(email, days)
    analyzed = sum(1 for item in reports if item.get("analysis_status") == "completed")
    return standard_response(data={
        "period_days": days,
        "profile": {"name": profile.get("name"), "email": email},
        "counts": {"reports": len(reports), "analyzed_reports": analyzed, "medicine_orders": len(orders)},
    })


@router.get("/generate")
async def generate_report(request: Request, days: int = 90):
    email = await require_auth(request)
    _validate_days(days)
    try:
        profile, reports, orders = await _load_data(email, days)
        buffer = io.BytesIO()
        document = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm, topMargin=18 * mm, bottomMargin=18 * mm)
        styles = getSampleStyleSheet()
        story = [
            Paragraph("Smart Health Summary", styles["Title"]),
            Paragraph("FYP demonstration record. AI report interpretation is decision support, not a diagnosis.", styles["Italic"]),
            Spacer(1, 8),
            Paragraph(f"<b>Patient:</b> {safe_str(profile.get('name') or email)}", styles["BodyText"]),
            Paragraph(f"<b>Period:</b> Last {days} days", styles["BodyText"]),
            Spacer(1, 14),
            Paragraph(f"Medical Reports ({len(reports)})", styles["Heading2"]),
        ]

        report_rows = [["Date", "File", "Type", "Risk", "Specialty"]]
        for item in reports:
            analysis = item.get("analysis") or {}
            specialty = analysis.get("specialty_recommendation") or {}
            uploaded = item.get("uploaded_at")
            report_rows.append([
                uploaded.strftime("%Y-%m-%d") if hasattr(uploaded, "strftime") else "",
                safe_str(item.get("original_filename") or item.get("filename"))[:28],
                safe_str(analysis.get("report_type") or "Pending")[:22],
                safe_str(analysis.get("risk_level") or "-"),
                safe_str(specialty.get("specialty") if isinstance(specialty, dict) else specialty)[:22],
            ])
        if len(report_rows) == 1:
            report_rows.append(["-", "No reports in this period", "-", "-", "-"])
        table = Table(report_rows, repeatRows=1, colWidths=[25 * mm, 48 * mm, 38 * mm, 22 * mm, 36 * mm])
        table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f766e")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), 0.4, colors.grey), ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 8), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
        story.extend([table, Spacer(1, 14), Paragraph(f"Demo Medicine Orders ({len(orders)})", styles["Heading2"])])

        order_rows = [["Date", "Items", "Total", "Status"]]
        for order in orders:
            created = order.get("created_at")
            names = ", ".join(safe_str(item.get("name")) for item in order.get("items", []) if isinstance(item, dict))
            order_rows.append([created.strftime("%Y-%m-%d") if hasattr(created, "strftime") else "", names[:70], safe_str(order.get("total")), safe_str(order.get("status"))])
        if len(order_rows) == 1:
            order_rows.append(["-", "No demo orders in this period", "-", "-"])
        table = Table(order_rows, repeatRows=1, colWidths=[28 * mm, 88 * mm, 25 * mm, 28 * mm])
        table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f766e")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), 0.4, colors.grey), ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 8), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
        story.append(table)
        document.build(story)
        buffer.seek(0)
        filename = f"smart_health_summary_{datetime.utcnow().strftime('%Y%m%d')}.pdf"
        return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{filename}"'})
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("PDF report failed for %s: %s", email, exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate report") from exc
