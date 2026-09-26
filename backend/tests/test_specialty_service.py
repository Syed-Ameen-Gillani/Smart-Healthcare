from services.specialty_service import recommend_specialty


def test_maps_glucose_finding_to_endocrinology():
    result = recommend_specialty({"abnormal_values": ["High fasting glucose"]})
    assert result["specialty"] == "Endocrinology"
    assert "glucose" in result["reason"].lower()


def test_maps_metric_name_and_status():
    result = recommend_specialty({
        "health_metrics": [{"name": "Creatinine", "status": "High"}],
        "abnormal_values": [],
    })
    assert result["specialty"] == "Nephrology"


def test_uses_general_medicine_fallback():
    result = recommend_specialty({"summary": "Report needs clinical review"})
    assert result["specialty"] == "General Medicine"
    assert result["is_fallback"] is True
