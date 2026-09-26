from services.gemini_service import normalize_report_analysis


def test_normalization_returns_canonical_shape_and_specialty():
    result = normalize_report_analysis({
        "report_type": "CBC",
        "summary": "Low hemoglobin was detected.",
        "health_metrics": {"Hemoglobin": "8.2 g/dL"},
        "key_findings": [" Anemia pattern ", ""],
        "abnormal_values": ["Low hemoglobin"],
        "risk_level": "HIGH",
        "recommendations": None,
    })

    assert result["risk_level"] == "High"
    assert result["key_findings"] == ["Anemia pattern"]
    assert result["recommendations"] == []
    assert result["specialty_recommendation"]["specialty"] == "Hematology"


def test_normalization_handles_unstructured_or_unreliable_output_safely():
    result = normalize_report_analysis("The uploaded report could not be read.")

    assert result["risk_level"] == "Unable to assess"
    assert result["abnormal_values"] == []
    assert result["specialty_recommendation"]["specialty"] == "General Medicine"


def test_unknown_risk_level_is_not_preserved():
    result = normalize_report_analysis({"risk_level": "severe-ish"})

    assert result["risk_level"] == "Unable to assess"
