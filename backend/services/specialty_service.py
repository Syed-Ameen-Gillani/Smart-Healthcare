"""Deterministic specialty recommendations for normalized report findings."""

import re
from typing import Any, Dict, Iterable

SPECIALTY_RULES = (
    ("Endocrinology", ("glucose", "hba1c", "diabetes", "thyroid", "tsh", "t3", "t4")),
    ("Cardiology", ("cholesterol", "ldl", "hdl", "triglyceride", "troponin", "cardiac")),
    ("Hematology", ("hemoglobin", "haemoglobin", "anemia", "platelet", "wbc", "cbc")),
    ("Gastroenterology", ("alt", "ast", "bilirubin", "liver", "hepatic")),
    ("Nephrology", ("creatinine", "urea", "egfr", "kidney", "renal")),
    ("Pulmonology", ("lung", "pulmonary", "oxygen saturation", "spo2")),
    ("Neurology", ("neurological", "seizure", "brain")),
)


def _text(values: Iterable[Any]) -> str:
    return " ".join(str(value) for value in values if value).lower()


def recommend_specialty(analysis: Dict[str, Any]) -> Dict[str, Any]:
    abnormal_text = _text(analysis.get("abnormal_values", []))
    metric_text = _text(
        f"{metric.get('name', '')} {metric.get('status', '')}"
        for metric in analysis.get("health_metrics", [])
        if isinstance(metric, dict) and str(metric.get("status", "")).lower() not in {"", "normal"}
    )
    abnormal_text = f"{abnormal_text} {metric_text}".strip()
    supporting_text = _text([
        *analysis.get("key_findings", []),
        analysis.get("summary", ""),
        analysis.get("report_type", ""),
    ])

    for specialty, terms in SPECIALTY_RULES:
        abnormal_matches = [term for term in terms if re.search(rf"\b{re.escape(term)}\b", abnormal_text)]
        supporting_matches = [term for term in terms if re.search(rf"\b{re.escape(term)}\b", supporting_text)]
        matches = abnormal_matches or supporting_matches
        if matches:
            source = "abnormal values" if abnormal_matches else "report findings"
            return {
                "specialty": specialty,
                "reason": f"Matched {', '.join(matches[:3])} in the report's {source}.",
                "matched_terms": matches,
                "confidence": "high" if abnormal_matches else "moderate",
                "is_fallback": False,
            }

    return {
        "specialty": "General Medicine",
        "reason": "No single specialty could be identified reliably from the report findings.",
        "matched_terms": [],
        "confidence": "fallback",
        "is_fallback": True,
    }
