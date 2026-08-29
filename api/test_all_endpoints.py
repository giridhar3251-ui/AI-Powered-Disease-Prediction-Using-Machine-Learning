import io
import requests
from PIL import Image

def test_api():
    print("Testing Backend & Frontend Services...\n")

    # 1. Health
    r = requests.get("http://localhost:8000/api/health")
    print(f"[1] Health Check: {r.status_code} -> {r.json()}")
    assert r.status_code == 200

    # 2. Symptoms
    r = requests.get("http://localhost:8000/api/symptoms")
    symptoms = r.json()
    print(f"[2] Symptoms Count: {len(symptoms)} (e.g. {symptoms[0]['label']})")
    assert len(symptoms) == 132

    # 3. Symptom Prediction (Common Cold)
    cold_payload = {"symptoms": ["continuous_sneezing", "chills", "fatigue", "cough", "headache", "throat_irritation", "runny_nose"], "top_k": 5}
    r = requests.post("http://localhost:8000/api/predict", json=cold_payload)
    pred = r.json()
    print(f"[3] Symptom Predict (Cold): {pred['primary_prediction']['disease']} ({pred['primary_prediction']['confidence']}%)")
    print(f"    Specialist: {pred['primary_prediction']['recommended_specialist']} | Rx: {pred['primary_prediction']['medicine_class']}")
    top_diseases = [pred['primary_prediction']['disease']] + [p['disease'] for p in pred.get('secondary_predictions', [])]
    assert any(d in top_diseases for d in ["Common Cold", "Influenza (Flu)", "COVID-19"])

    # 4. Image Model Info
    r = requests.get("http://localhost:8000/api/image-model-info")
    print(f"[4] Skin Model Info: {r.json()}")
    assert r.status_code == 200

    # 5. Skin Prediction
    img = Image.new("RGB", (64, 64), color=(220, 100, 100))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    files = {"file": ("skin_test.png", buf, "image/png")}
    r = requests.post("http://localhost:8000/api/predict-image", files=files)
    skin_res = r.json()
    print(f"[5] Skin Predict: {skin_res['title']} (Confidence: {skin_res['confidence']}%)")
    assert r.status_code == 200

    # 6. Districts
    r = requests.get("http://localhost:8000/api/districts")
    districts = r.json()["districts"]
    print(f"[6] Districts Count: {len(districts)} (e.g. {districts[:5]})")
    assert len(districts) == 38

    # 7. Hospitals Search
    r = requests.get("http://localhost:8000/api/hospitals?district=Chennai")
    hospitals = r.json()["results"]
    print(f"[7] Hospitals in Chennai: {len(hospitals)} facilities (Top: {hospitals[0]['name']} - {hospitals[0]['rating']} stars)")
    assert len(hospitals) > 0

    # 8. Branch Lookup
    r = requests.get("http://localhost:8000/api/hospitals/hosp-1/branch-lookup?target_district=Madurai")
    branch = r.json()
    print(f"[8] Branch Lookup (Apollo -> Madurai): has_branch={branch['has_branch']} -> {branch['branch_details']['name']}")
    assert branch["has_branch"] == True

    # 9. Auth Login (Clinician Demo)
    r = requests.post("http://localhost:8000/api/auth/login", json={"email": "doctor@aegismed.ai", "password": "password123", "role": "Clinician"})
    login_data = r.json()
    print(f"[9] Clinician Auth: {login_data['user']['name']} ({login_data['user']['role']}) -> Token: {login_data['token'][:16]}...")
    assert r.status_code == 200
    assert login_data["user"]["role"] == "Clinician"

    # 10. Auth Register
    import time
    r = requests.post("http://localhost:8000/api/auth/register", json={
        "name": "Dr. Ramesh Kumar",
        "email": f"dr.ramesh_{int(time.time())}@apollo.com",
        "password": "securepass123",
        "role": "Clinician",
        "institution": "Apollo Speciality Hospitals, Madurai"
    })
    reg_data = r.json()
    print(f"[10] Auth Register: {reg_data['user']['name']} registered successfully")
    assert r.status_code == 200

    # 11. Frontend Serving
    r = requests.get("http://localhost:5174")
    print(f"[11] Frontend Vite Server: {r.status_code} ({len(r.text)} bytes)")
    assert r.status_code == 200

    print("\nAll 11 End-to-End Tests Passed Flawlessly!")


if __name__ == "__main__":
    test_api()
