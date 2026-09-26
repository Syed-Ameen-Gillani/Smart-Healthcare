from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


OUTPUT_DIR = Path(__file__).resolve().parents[1] / "output" / "pdf"


def build_report(filename, title, patient_id, rows, interpretation):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUTPUT_DIR / filename
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="CenteredTitle", parent=styles["Title"], alignment=TA_CENTER, textColor=colors.HexColor("#0E7490")))
    doc = SimpleDocTemplate(str(path), pagesize=A4, rightMargin=20 * mm, leftMargin=20 * mm, topMargin=18 * mm, bottomMargin=18 * mm)
    story = [
        Paragraph("SMART HEALTH DEMO LABORATORY", styles["CenteredTitle"]),
        Paragraph("Fictional sample report for academic testing only", ParagraphStyle(name="Subtitle", parent=styles["Normal"], alignment=TA_CENTER, textColor=colors.HexColor("#64748B"))),
        Spacer(1, 8 * mm),
        Table([
            ["Report", title], ["Patient", "Demo Patient"], ["Patient ID", patient_id],
            ["Collection date", "15 September 2026"], ["Status", "FINAL - DEMONSTRATION DATA"],
        ], colWidths=[42 * mm, 118 * mm], style=TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#ECFEFF")), ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#155E75")),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ])),
        Spacer(1, 8 * mm),
        Paragraph("Complete Blood Count", styles["Heading2"]),
    ]
    data = [["Test", "Result", "Reference range", "Flag"]] + rows
    story.append(Table(data, colWidths=[48 * mm, 32 * mm, 52 * mm, 28 * mm], repeatRows=1, style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0E7490")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ("ALIGN", (1, 1), (-1, -1), "CENTER"), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ])))
    story.extend([
        Spacer(1, 8 * mm), Paragraph("Laboratory note", styles["Heading2"]), Paragraph(interpretation, styles["BodyText"]),
        Spacer(1, 12 * mm), Paragraph("This document contains fictional values for the Smart Health final-year-project demonstration. It is not a clinical record and must not be used for diagnosis or treatment.", ParagraphStyle(name="Disclaimer", parent=styles["BodyText"], textColor=colors.HexColor("#92400E"), borderColor=colors.HexColor("#F59E0B"), borderWidth=1, borderPadding=8, backColor=colors.HexColor("#FFFBEB"))),
    ])
    doc.build(story)
    return path


if __name__ == "__main__":
    normal = build_report("smart-health-normal-cbc.pdf", "Normal CBC", "DEMO-N-001", [
        ["Hemoglobin", "14.2 g/dL", "12.0-16.0 g/dL", "Normal"], ["White blood cells", "7.1 x10^9/L", "4.0-11.0 x10^9/L", "Normal"],
        ["Platelets", "265 x10^9/L", "150-450 x10^9/L", "Normal"], ["Red blood cells", "4.8 x10^12/L", "4.2-5.4 x10^12/L", "Normal"],
        ["Hematocrit", "42%", "36-46%", "Normal"],
    ], "All listed CBC measurements are within the demonstration reference ranges.")
    abnormal = build_report("smart-health-abnormal-cbc.pdf", "Abnormal CBC", "DEMO-A-001", [
        ["Hemoglobin", "8.4 g/dL", "12.0-16.0 g/dL", "LOW"], ["White blood cells", "14.8 x10^9/L", "4.0-11.0 x10^9/L", "HIGH"],
        ["Platelets", "92 x10^9/L", "150-450 x10^9/L", "LOW"], ["Red blood cells", "3.2 x10^12/L", "4.2-5.4 x10^12/L", "LOW"],
        ["Hematocrit", "27%", "36-46%", "LOW"],
    ], "Multiple abnormal CBC values are present. The expected Smart Health specialty mapping is Hematology, with a recommendation to seek professional clinical review.")
    print(normal)
    print(abnormal)
