"""Exercise the Smart Health FYP API workflow against a running local backend."""

import json
from pathlib import Path

import requests


BASE_URL = "http://127.0.0.1:8000"
EMAIL = "demo.smarthealth.fyp@example.com"
PASSWORD = "DemoHealth2026"
ROOT = Path(__file__).resolve().parents[1]


def checked(response):
    response.raise_for_status()
    payload = response.json()
    if not payload.get("success"):
        raise RuntimeError(payload.get("message") or payload)
    return payload


def main():
    login = checked(requests.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=30))
    token = login["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    def upload_and_analyze(filename):
        report_path = ROOT / "output" / "pdf" / filename
        with report_path.open("rb") as stream:
            upload = checked(requests.post(
                f"{BASE_URL}/files/upload", headers=headers,
                files={"file": (report_path.name, stream, "application/pdf")}, timeout=180,
            ))
        report_id = upload["data"]["file_id"]
        response = checked(requests.get(f"{BASE_URL}/files/{report_id}/analysis", headers=headers, timeout=180))
        response_data = response.get("data", {})
        report_analysis = response_data.get("analysis") or response_data.get("data", {}).get("analysis") or {}
        return report_id, report_analysis

    normal_file_id, normal_analysis = upload_and_analyze("smart-health-normal-cbc.pdf")
    file_id, analysis = upload_and_analyze("smart-health-abnormal-cbc.pdf")
    if normal_analysis.get("risk_level") not in {"Low", "Unable to assess"}:
        raise RuntimeError(f"Normal control report returned unexpected risk: {normal_analysis.get('risk_level')}")
    specialty = analysis.get("specialty_recommendation", {}).get("specialty")
    if not specialty:
        raise RuntimeError("Analysis did not contain a specialty recommendation")

    doctors = checked(requests.get(f"{BASE_URL}/doctors", headers=headers, params={"specialization": specialty, "city": "Rawalpindi", "limit": 50}, timeout=30))
    doctor_items = doctors.get("data", {}).get("doctors", [])
    if not doctor_items:
        doctors = checked(requests.get(f"{BASE_URL}/doctors", headers=headers, params={"specialization": specialty, "limit": 50}, timeout=30))
        doctor_items = doctors.get("data", {}).get("doctors", [])
    if not doctor_items:
        raise RuntimeError(f"No seeded doctors found for {specialty}")

    catalog = checked(requests.get(f"{BASE_URL}/medicine-catalog", headers=headers, timeout=30))["data"]["medicines"]
    prescription_item = next(item for item in catalog if item.get("requires_prescription"))
    order = checked(requests.post(f"{BASE_URL}/medicine-orders", headers=headers, json={
        "items": [{"medicine_id": prescription_item["_id"], "quantity": 1}],
        "report_id": file_id,
        "delivery_name": "Demo Patient",
        "delivery_phone": "03005550123",
        "delivery_address": "Smart Health FYP demonstration address, Islamabad",
    }, timeout=30))["data"]["order"]
    history = checked(requests.get(f"{BASE_URL}/medicine-orders", headers=headers, timeout=30))["data"]["orders"]
    if not any(item["_id"] == order["_id"] for item in history):
        raise RuntimeError("Created order was not returned in order history")

    print(json.dumps({
        "success": True,
        "normal_report_id": normal_file_id,
        "normal_risk_level": normal_analysis.get("risk_level"),
        "normal_abnormal_values": len(normal_analysis.get("abnormal_values", [])),
        "report_id": file_id,
        "report_type": analysis.get("report_type"),
        "risk_level": analysis.get("risk_level"),
        "specialty": specialty,
        "matching_doctors": len(doctor_items),
        "order_id": order["_id"],
        "order_status": order["status"],
        "order_total": order["total"],
    }, indent=2))


if __name__ == "__main__":
    main()
