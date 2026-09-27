"""Gemini chat and medical-report analysis for Smart Health."""

import json
import logging
from pathlib import Path
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)
gemini_client = None
GEMINI_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.6-flash"]


def initialize_gemini(api_key: str) -> bool:
    global gemini_client
    if not api_key:
        logger.warning("GEMINI_API_KEY is not configured; Gemini features are disabled")
        return False
    try:
        from google import genai
        gemini_client = genai.Client(api_key=api_key)
        logger.info("Gemini initialized")
        return True
    except Exception as exc:
        logger.error("Gemini initialization failed: %s", exc)
        return False


def is_gemini_available() -> bool:
    return gemini_client is not None


def _extract_text(response) -> str:
    try:
        parts = response.candidates[0].content.parts
        text = "".join(part.text for part in parts if getattr(part, "text", None))
        if text:
            return text
    except (AttributeError, IndexError, TypeError):
        pass
    return getattr(response, "text", "") or ""


async def call_gemini(prompt: str, config=None) -> str:
    if not gemini_client:
        raise RuntimeError("Gemini client not initialized")
    from google.genai import types
    generation_config = config or types.GenerateContentConfig(temperature=0.4, max_output_tokens=4000)
    last_error = None
    for model_name in GEMINI_MODELS:
        try:
            response = gemini_client.models.generate_content(model=model_name, contents=prompt, config=generation_config)
            text = _extract_text(response)
            if text:
                return text
        except Exception as exc:
            last_error = exc
            if "401" in str(exc) or "API key" in str(exc):
                break
    logger.error("Gemini request failed: %s", last_error)
    raise RuntimeError("Gemini is temporarily unavailable") from last_error


async def gemini_health_chat(message: str, context: Optional[Dict] = None) -> str:
    context = context or {}
    patient_context = ", ".join(f"{key}: {value}" for key, value in context.items() if value) or "No patient context"
    prompt = f"""You are Smart Health's general health information assistant.

Safety rules:
- Do not diagnose, prescribe, or claim to replace a clinician.
- If the message suggests an emergency, lead with instructions to contact local emergency services immediately.
- Do not invent facts. State uncertainty and recommend verification by a qualified professional.
- Keep the answer concise, useful, and specific to the question.
- End with: "This is AI-generated health information, not a medical diagnosis."

Context: {patient_context}
Question: {message}"""
    return await call_gemini(prompt)


async def gemini_chat_stream(message: str, context: Optional[Dict] = None):
    # The API route remains stream-compatible while using the same safety prompt.
    yield await gemini_health_chat(message, context)


VALID_RISK_LEVELS = {
    "low": "Low",
    "moderate": "Moderate",
    "medium": "Moderate",
    "high": "High",
    "critical": "Critical",
    "unable to assess": "Unable to assess",
}


def normalize_report_analysis(analysis: Any) -> Dict[str, Any]:
    if not isinstance(analysis, dict):
        analysis = {"summary": str(analysis or "")}

    def clean_list(value):
        return [str(item).strip() for item in value if str(item).strip()] if isinstance(value, list) else []

    metrics = analysis.get("health_metrics")
    metrics = metrics if isinstance(metrics, dict) else {}
    normalized = {
        "report_type": str(analysis.get("report_type") or "Unknown").strip(),
        "patient_info": str(analysis.get("patient_info") or "Not specified").strip(),
        "report_date": str(analysis.get("report_date") or "Not specified").strip(),
        "summary": str(analysis.get("summary") or "No summary available.").strip(),
        "health_metrics": {str(key).strip(): str(value).strip() for key, value in metrics.items() if str(key).strip() and str(value).strip()},
        "key_findings": clean_list(analysis.get("key_findings")),
        "abnormal_values": clean_list(analysis.get("abnormal_values")),
        "risk_level": VALID_RISK_LEVELS.get(str(analysis.get("risk_level") or "").strip().lower(), "Unable to assess"),
        "recommendations": clean_list(analysis.get("recommendations")),
        "limitations": str(analysis.get("limitations") or "None reported.").strip(),
    }
    from services.specialty_service import recommend_specialty
    normalized["specialty_recommendation"] = recommend_specialty(normalized)
    return normalized


REPORT_PROMPT = """Analyze this medical report as a clinical laboratory assistant. Extract only information visible in the document and never fabricate a value.

Return strict JSON with this shape:
{
  "report_type": "string",
  "patient_info": "string or Not specified",
  "report_date": "string or Not specified",
  "summary": "2-3 sentence decision-support summary",
  "health_metrics": {"Test": "Value Unit [Reference Range] (NORMAL/HIGH/LOW/CRITICAL)"},
  "key_findings": ["finding"],
  "abnormal_values": ["actual value versus reference range"],
  "risk_level": "Low, Moderate, High, Critical, or Unable to assess",
  "recommendations": ["action"],
  "limitations": "unclear or missing information"
}

The result is decision support, not a diagnosis. If the document is unreadable, leave metrics empty and explain why in limitations."""


async def _analyze_media(content_part) -> Dict[str, Any]:
    response_text = ""
    last_error = None
    for model_name in GEMINI_MODELS:
        try:
            response = gemini_client.models.generate_content(model=model_name, contents=[content_part, REPORT_PROMPT])
            response_text = _extract_text(response)
            if response_text:
                break
        except Exception as exc:
            last_error = exc
    if not response_text:
        logger.error("Report analysis failed: %s", last_error)
        return {"success": False, "error": "Report analysis unavailable"}
    cleaned = response_text.replace("```json", "").replace("```", "").strip()
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        parsed = {"summary": cleaned, "limitations": "Gemini did not return structured JSON.", "risk_level": "Unable to assess"}
    return {"success": True, "analysis": normalize_report_analysis(parsed)}


async def analyze_pdf_report(file_path: str) -> Dict[str, Any]:
    if not gemini_client:
        return {"success": False, "error": "Gemini unavailable"}
    try:
        from google.genai import types
        part = types.Part.from_bytes(data=Path(file_path).read_bytes(), mime_type="application/pdf")
        return await _analyze_media(part)
    except Exception as exc:
        logger.error("PDF analysis failed: %s", exc)
        return {"success": False, "error": "PDF analysis failed"}


async def analyze_image_report(file_path: str) -> Dict[str, Any]:
    if not gemini_client:
        return {"success": False, "error": "Gemini unavailable"}
    try:
        from google.genai import types
        suffix = Path(file_path).suffix.lower()
        mime_type = "image/png" if suffix == ".png" else "image/jpeg"
        part = types.Part.from_bytes(data=Path(file_path).read_bytes(), mime_type=mime_type)
        return await _analyze_media(part)
    except Exception as exc:
        logger.error("Image analysis failed: %s", exc)
        return {"success": False, "error": "Image analysis failed"}


async def process_medical_report(file_path: str, content_type: str) -> Dict[str, Any]:
    if content_type == "application/pdf":
        return await analyze_pdf_report(file_path)
    if content_type.startswith("image/"):
        return await analyze_image_report(file_path)
    return {"success": False, "error": "Unsupported report format"}
