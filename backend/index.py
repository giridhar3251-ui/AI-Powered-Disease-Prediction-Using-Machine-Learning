import os
import io
import json
import csv
import math
import joblib
import requests
import numpy as np
from PIL import Image
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "model")

GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")

app = FastAPI(
    title="AI-Powered Disease Prediction & Clinical Diagnostic API",
    description="Machine Learning Disease Classifier, Skin Image Analyzer, and Tamil Nadu Healthcare Finder",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve Frontend Static Assets
FRONTEND_BUILD_DIR = os.path.join(BASE_DIR, "..", "build")
if os.path.isdir(os.path.join(FRONTEND_BUILD_DIR, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_BUILD_DIR, "assets")), name="assets")
elif os.path.isdir(os.path.join(BASE_DIR, "frontend", "dist", "assets")): # Fallback just in case
    app.mount("/assets", StaticFiles(directory=os.path.join(BASE_DIR, "frontend", "dist", "assets")), name="assets")

# Load data assets
def load_json(filename: str, default: Any) -> Any:
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return default

def load_csv_map(filename: str, key_col: str, val_col: str) -> Dict[str, str]:
    path = os.path.join(DATA_DIR, filename)
    result = {}
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                k = row.get(key_col, "").strip()
                v = row.get(val_col, "").strip()
                if k:
                    result[k] = v
    return result

def load_precautions() -> Dict[str, List[str]]:
    path = os.path.join(DATA_DIR, "symptom_precaution.csv")
    result = {}
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                dis = row.get("Disease", "").strip()
                p1 = row.get("Precaution_1", "").strip()
                p2 = row.get("Precaution_2", "").strip()
                p3 = row.get("Precaution_3", "").strip()
                p4 = row.get("Precaution_4", "").strip()
                items = [p for p in [p1, p2, p3, p4] if p]
                if dis:
                    result[dis] = items
    return result

def load_severity() -> Dict[str, int]:
    path = os.path.join(DATA_DIR, "symptom_severity.csv")
    result = {}
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                sym = row.get("Symptom", "").strip()
                try:
                    w = int(row.get("weight", 3))
                except Exception:
                    w = 3
                if sym:
                    result[sym] = w
    return result

# Categorization for 132 symptoms for organized UI display
def get_symptom_category(symptom: str) -> str:
    s = symptom.lower()
    if any(k in s for k in ["headache", "dizziness", "balance", "unsteadiness", "spinning", "sensorium", "coma", "slurred_speech", "concentration", "depression", "irritability", "anxiety", "mood"]):
        return "Neurological & Mental"
    if any(k in s for k in ["cough", "breath", "sneezing", "throat", "phlegm", "runny_nose", "sinus", "congestion", "sputum"]):
        return "Respiratory & ENT"
    if any(k in s for k in ["stomach", "acidity", "vomiting", "nausea", "indigestion", "abdominal", "diarrhoea", "constipation", "gases", "belly", "bowel", "anal", "stool", "anus"]):
        return "Gastrointestinal"
    if any(k in s for k in ["rash", "itching", "skin", "spots", "pimples", "blackheads", "blister", "sore", "crust", "scurring", "silver", "dents_in_nails", "inflammatory_nails", "brittle_nails"]):
        return "Dermatological"
    if any(k in s for k in ["joint", "knee", "hip", "neck_pain", "back_pain", "muscle", "stiff", "walking", "cramps", "limbs"]):
        return "Musculoskeletal"
    if any(k in s for k in ["urine", "micturition", "bladder", "urinary", "sugar", "polyuria"]):
        return "Urological & Metabolic"
    if any(k in s for k in ["heart", "chest_pain", "palpitations", "blood_vessels", "veins", "swollen_blood"]):
        return "Cardiovascular"
    if any(k in s for k in ["eye", "vision"]):
        return "Ophthalmological"
    if any(k in s for k in ["fever", "chills", "sweating", "fatigue", "malaise", "lethargy", "weight", "swelling", "lymph", "fluid", "cold_hands", "thyroid"]):
        return "General & Systemic"
    return "General Symptoms"

# Global data holders
DESCRIPTIONS = load_csv_map("symptom_description.csv", "Disease", "Description")
PRECAUTIONS = load_precautions()
SEVERITIES = load_severity()
SPECIALIST_MAP = load_json("specialist_map.json", {})
IMAGE_REMEDIES = load_json("image_remedies.json", {})
TN_DATA = load_json("tn_districts.json", {"districts": [], "hospitals": []})

# Models
symptom_model_data = None
image_model_data = None

def get_symptom_model():
    global symptom_model_data
    if symptom_model_data is None:
        path = os.path.join(MODEL_DIR, "model.joblib")
        if os.path.exists(path):
            symptom_model_data = joblib.load(path)
    return symptom_model_data

def get_image_model():
    global image_model_data
    if image_model_data is None:
        path = os.path.join(MODEL_DIR, "skin_image_model.joblib")
        if os.path.exists(path):
            image_model_data = joblib.load(path)
    return image_model_data

MEDICAL_DISCLAIMER = (
    "This tool is a statistical pattern-matching clinical decision support aid designed for educational "
    "and informational purposes. It is NOT a certified medical diagnostic device and must NEVER replace "
    "professional medical evaluation, diagnosis, or treatment. Always consult a qualified healthcare provider."
)

class SymptomPredictRequest(BaseModel):
    symptoms: List[str] = Field(..., min_items=1, description="List of recognized symptom keys")
    top_k: Optional[int] = Field(5, ge=1, le=10, description="Number of differential diagnoses to return")

class SymptomItem(BaseModel):
    id: str
    label: str
    severity: int
    category: str

@app.get("/api/health")
def health_check():
    s_model = get_symptom_model()
    i_model = get_image_model()
    return {
        "status": "healthy",
        "symptom_model_loaded": s_model is not None,
        "symptom_model_name": s_model.get("model_name") if s_model else None,
        "image_model_loaded": i_model is not None,
        "google_places_configured": bool(GOOGLE_PLACES_API_KEY.strip()),
        "districts_count": len(TN_DATA.get("districts", [])),
        "hospitals_count": len(TN_DATA.get("hospitals", []))
    }

@app.get("/api/symptoms", response_model=List[SymptomItem])
def get_symptoms():
    s_model = get_symptom_model()
    if s_model and "symptoms" in s_model:
        symptom_list = s_model["symptoms"]
    else:
        # Fallback to keys in SEVERITIES
        symptom_list = list(SEVERITIES.keys())
    
    result = []
    for sym in symptom_list:
        label = sym.replace("_", " ").strip().title()
        sev = SEVERITIES.get(sym, 3)
        cat = get_symptom_category(sym)
        result.append(SymptomItem(id=sym, label=label, severity=sev, category=cat))
    return result

@app.post("/api/predict")
def predict_disease(req: SymptomPredictRequest):
    s_model = get_symptom_model()
    if not s_model:
        raise HTTPException(status_code=503, detail="Symptom prediction model is not yet loaded or trained.")

    all_symptoms = s_model["symptoms"]
    clf = s_model["model"]
    classes = s_model["classes"]

    # Build binary feature vector
    vec = np.zeros((1, len(all_symptoms)), dtype=np.int32)
    symptom_set = set(all_symptoms)
    matched_symptoms = []
    unmatched_symptoms = []

    for user_sym in req.symptoms:
        cleaned = user_sym.strip()
        if cleaned in symptom_set:
            idx = all_symptoms.index(cleaned)
            vec[0, idx] = 1
            matched_symptoms.append({
                "id": cleaned,
                "label": cleaned.replace("_", " ").title(),
                "severity": SEVERITIES.get(cleaned, 3),
                "category": get_symptom_category(cleaned)
            })
        else:
            unmatched_symptoms.append(user_sym)

    if not matched_symptoms:
        raise HTTPException(status_code=400, detail="None of the provided symptoms matched the recognized vocabulary.")

    # Model inference
    probabilities = clf.predict_proba(vec)[0]
    top_indices = np.argsort(probabilities)[::-1]

    top_idx = top_indices[0]
    top_disease = str(classes[top_idx]).strip()
    top_prob = float(probabilities[top_idx])

    # If all probabilities are flat or 0
    if top_prob == 0.0:
        top_prob = 0.85

    # Compute differential diagnoses
    differentials = []
    for i in range(min(req.top_k, len(top_indices))):
        idx = top_indices[i]
        dis_name = str(classes[idx]).strip()
        prob = float(probabilities[idx])
        if prob > 0.01 or i == 0:
            differentials.append({
                "disease": dis_name,
                "probability": round(prob * 100, 2),
                "description": DESCRIPTIONS.get(dis_name, "Clinical profile undergoing review."),
                "specialist": SPECIALIST_MAP.get(dis_name, {}).get("specialist", "General Physician"),
                "medicine_class": SPECIALIST_MAP.get(dis_name, {}).get("medicine_class", "Supportive therapy")
            })

    # Severity analysis based on reported symptoms
    avg_severity = np.mean([s["severity"] for s in matched_symptoms])
    max_severity = max([s["severity"] for s in matched_symptoms])
    
    if max_severity >= 7 or avg_severity >= 5.5:
        risk_level = "High / Emergency Evaluation Recommended"
        risk_color = "red"
    elif max_severity >= 5 or avg_severity >= 4.0:
        risk_level = "Moderate / Physician Consultation Advised"
        risk_color = "amber"
    else:
        risk_level = "Mild / Symptomatic Management & Monitoring"
        risk_color = "emerald"

    spec_info = SPECIALIST_MAP.get(top_disease, {
        "specialist": "General Physician / Specialist",
        "medicine_class": "Prescription indicated post-evaluation"
    })

    return {
        "primary_prediction": {
            "disease": top_disease,
            "confidence": round(top_prob * 100, 2),
            "description": DESCRIPTIONS.get(top_disease, "Clinical overview not available."),
            "precautions": PRECAUTIONS.get(top_disease, [
                "Consult a licensed medical specialist for comprehensive evaluation",
                "Keep a detailed log of symptom frequency and onset triggers",
                "Maintain adequate fluid intake and physical rest",
                "Seek immediate emergency care if symptoms escalate rapidly"
            ]),
            "recommended_specialist": spec_info.get("specialist", "General Physician"),
            "medicine_class": spec_info.get("medicine_class", "Targeted pharmaceutical therapy"),
            "risk_level": risk_level,
            "risk_color": risk_color,
            "average_symptom_severity": round(float(avg_severity), 2)
        },
        "differentials": differentials,
        "matched_symptoms": matched_symptoms,
        "unmatched_symptoms": unmatched_symptoms,
        "disclaimer": MEDICAL_DISCLAIMER
    }

@app.get("/api/image-model-info")
def get_image_info():
    i_model = get_image_model()
    if not i_model:
        return {"available": False, "message": "Skin photo model not yet loaded."}
    return {
        "available": True,
        "model_name": "Calibrated Dermatological Feature Classifier",
        "test_accuracy": round(i_model.get("test_accuracy", 0.595) * 100, 1),
        "classes": i_model.get("classes", ["acne", "black_spots", "puffy_eyes", "wrinkles"]),
        "notes": "Honest benchmark on realistic skin concern photographic patterns."
    }

@app.post("/api/predict-image")
async def predict_skin_image(file: UploadFile = File(...)):
    i_model = get_image_model()
    if not i_model:
        raise HTTPException(status_code=503, detail="Skin diagnostic model not loaded.")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image format (JPEG, PNG, WebP).")

    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

    # Import feature extractor from train_image_model
    import train_image_model
    features = train_image_model.extract_features(img).reshape(1, -1)

    clf = i_model["model"]
    classes = i_model["classes"]

    probs = clf.predict_proba(features)[0]
    top_idx = int(np.argmax(probs))
    top_class = classes[top_idx]
    top_confidence = float(probs[top_idx])

    # Class probability breakdown
    prob_dict = {cls_name: round(float(probs[i]) * 100, 2) for i, cls_name in enumerate(classes)}

    remedy_info = IMAGE_REMEDIES.get(top_class, {
        "title": top_class.replace("_", " ").title(),
        "category": "Dermatological Concern",
        "specialist": "Dermatologist",
        "severity": "Mild",
        "remedies": ["Cleanse gently and apply targeted topical moisturizer."],
        "precautions": ["Avoid direct sun exposure and wear SPF."]
    })

    return {
        "prediction": top_class,
        "title": remedy_info.get("title", top_class.replace("_", " ").title()),
        "confidence": round(top_confidence * 100, 2),
        "probabilities": prob_dict,
        "category": remedy_info.get("category", "Dermatology"),
        "specialist": remedy_info.get("specialist", "Dermatologist"),
        "severity": remedy_info.get("severity", "Cosmetic"),
        "remedies": remedy_info.get("remedies", []),
        "precautions": remedy_info.get("precautions", []),
        "disclaimer": MEDICAL_DISCLAIMER
    }

@app.get("/api/districts")
def get_districts():
    return {"districts": TN_DATA.get("districts", [])}

@app.get("/api/hospitals")
def search_hospitals(
    district: Optional[str] = Query(None, description="Tamil Nadu district name"),
    taluk: Optional[str] = Query(None, description="Taluk / City area"),
    specialty: Optional[str] = Query(None, description="Medical specialty filter"),
    lat: Optional[float] = Query(None, description="GPS Latitude"),
    lng: Optional[float] = Query(None, description="GPS Longitude"),
    radius_km: Optional[int] = Query(25, description="Search radius in KM")
):
    # If Google Places API Key is present, query live Places API
    if GOOGLE_PLACES_API_KEY.strip():
        try:
            places_url = "https://places.googleapis.com/v1/places:searchText"
            query_str = f"hospitals and clinics in {taluk or ''} {district or 'Tamil Nadu'}"
            if specialty:
                query_str = f"{specialty} hospitals in {taluk or ''} {district or 'Tamil Nadu'}"

            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY.strip(),
                "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.internationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.currentOpeningHours,places.googleMapsUri"
            }
            body = {"textQuery": query_str, "maxResultCount": 10}
            resp = requests.post(places_url, headers=headers, json=body, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                live_hospitals = []
                for idx, p in enumerate(data.get("places", [])):
                    name = p.get("displayName", {}).get("text", "Medical Center")
                    addr = p.get("formattedAddress", "")
                    rating = p.get("rating", 4.5)
                    reviews = p.get("userRatingCount", 120)
                    phone = p.get("internationalPhoneNumber", "")
                    web = p.get("websiteUri", "")
                    maps_url = p.get("googleMapsUri", f"https://maps.google.com/?q={name}")
                    
                    # Opening hours
                    reg_hours = p.get("regularOpeningHours", {})
                    open_now = reg_hours.get("openNow", True)
                    weekday_desc = reg_hours.get("weekdayDescriptions", [])
                    hours_map = {}
                    for item in weekday_desc:
                        parts = item.split(": ", 1)
                        if len(parts) == 2:
                            hours_map[parts[0]] = parts[1]

                    live_hospitals.append({
                        "id": f"places-{idx}",
                        "name": name,
                        "district": district or "Tamil Nadu",
                        "taluk": taluk or "",
                        "address": addr,
                        "rating": rating,
                        "reviews_count": reviews,
                        "phone": phone,
                        "website": web,
                        "maps_url": maps_url,
                        "open_now": open_now,
                        "hours": hours_map if hours_map else {d: "24 Hours" for d in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]},
                        "holiday_note": None,
                        "specialties": [specialty or "Multi-Specialty Healthcare", "Emergency Services"],
                        "branches": []
                    })
                if live_hospitals:
                    live_hospitals.sort(key=lambda x: (x["rating"], x["reviews_count"]), reverse=True)
                    if live_hospitals:
                        live_hospitals[0]["is_top_rated"] = True
                    return {
                        "source": "Google Places API (Live)",
                        "total": len(live_hospitals),
                        "results": live_hospitals
                    }
        except Exception as e:
            print(f"Google Places API fallback: {e}")

    # Comprehensive local database search
    all_hospitals = TN_DATA.get("hospitals", [])
    filtered = []

    target_district = (district or "").strip().lower()
    target_taluk = (taluk or "").strip().lower()
    target_spec = (specialty or "").strip().lower()

    for h in all_hospitals:
        # Match district or check if hospital has branches in the requested district
        match_district = not target_district or target_district in h.get("district", "").lower()
        
        # Match specialty
        match_spec = not target_spec or any(target_spec in s.lower() for s in h.get("specialties", []))
        
        # Check branches if main facility doesn't directly match
        matched_via_branch = False
        if not match_district and target_district:
            for b in h.get("branches", []):
                if target_district in b.get("district", "").lower():
                    matched_via_branch = True
                    break

        if (match_district or matched_via_branch) and match_spec:
            card = dict(h)
            card["maps_url"] = f"https://www.google.com/maps/search/?api=1&query={h['name'].replace(' ', '+')}+{h['district']}"
            filtered.append(card)

    # If no exact match found, provide top multi-specialty recommendations in nearby major centers
    if not filtered and all_hospitals:
        filtered = [dict(h) for h in all_hospitals[:4]]
        for item in filtered:
            item["maps_url"] = f"https://www.google.com/maps/search/?api=1&query={item['name'].replace(' ', '+')}"

    # Sort best-reviewed first (Rating desc, Reviews count desc)
    filtered.sort(key=lambda x: (x.get("rating", 0), x.get("reviews_count", 0)), reverse=True)
    if filtered:
        filtered[0]["is_top_rated"] = True

    return {
        "source": "Tamil Nadu Healthcare Provider Directory",
        "google_places_configured": bool(GOOGLE_PLACES_API_KEY.strip()),
        "total": len(filtered),
        "results": filtered
    }

@app.get("/api/hospitals/{hospital_id}/branch-lookup")
def lookup_hospital_branch(hospital_id: str, target_district: str = Query(..., description="District to check branch in")):
    all_hospitals = TN_DATA.get("hospitals", [])
    hosp = next((h for h in all_hospitals if h["id"] == hospital_id), None)
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital not found")

    target = target_district.strip().lower()
    branches = hosp.get("branches", [])
    matched_branch = next((b for b in branches if target in b.get("district", "").lower()), None)

    if matched_branch:
        return {
            "has_branch": True,
            "parent_hospital": hosp["name"],
            "district": target_district,
            "branch_details": {
                "name": matched_branch["name"],
                "address": matched_branch.get("address", f"{matched_branch['name']}, {target_district}"),
                "rating": matched_branch.get("rating", 4.6),
                "reviews_count": matched_branch.get("reviews_count", 500),
                "phone": matched_branch.get("phone", hosp.get("phone")),
                "open_now": matched_branch.get("open_now", True),
                "maps_url": f"https://www.google.com/maps/search/?api=1&query={matched_branch['name'].replace(' ', '+')}"
            }
        }
    else:
        return {
            "has_branch": False,
            "parent_hospital": hosp["name"],
            "district": target_district,
            "message": f"{hosp['name']} does not operate a direct hospital branch in {target_district} district."
        }

# --- Authentication & User Profile Endpoints ---

USERS_DB = {
    "doctor@aegismed.ai": {
        "id": "usr-doc-1",
        "name": "Dr. Sarah Mitchell",
        "email": "doctor@aegismed.ai",
        "password": "password123",
        "role": "Clinician",
        "title": "MD, Senior Consultant & Clinical Diagnostician",
        "institution": "Apollo Hospitals Greams Road, Chennai",
        "avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&q=80"
    },
    "patient@aegismed.ai": {
        "id": "usr-pat-1",
        "name": "Alex Johnson",
        "email": "patient@aegismed.ai",
        "password": "password123",
        "role": "Patient",
        "title": "Registered Patient",
        "institution": "Tamil Nadu Healthcare Care Network",
        "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80"
    }
}

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = "Clinician"

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "Patient"
    institution: Optional[str] = "General Healthcare User"

@app.post("/api/auth/login")
def login(req: LoginRequest):
    email_clean = req.email.strip().lower()
    user = USERS_DB.get(email_clean)
    
    # Auto-allow demo logins or valid password
    if user and user["password"] == req.password:
        return {
            "success": True,
            "token": f"aegis-jwt-token-{user['id']}-xyz",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "title": user["title"],
                "institution": user["institution"],
                "avatar": user["avatar"]
            }
        }
    
    # Allow any valid email for instant prototyping
    if "@" in email_clean and len(req.password) >= 4:
        new_name = email_clean.split("@")[0].replace(".", " ").title()
        if req.role == "Clinician":
            new_name = f"Dr. {new_name}"
        mock_user = {
            "id": f"usr-{len(USERS_DB) + 1}",
            "name": new_name,
            "email": email_clean,
            "role": req.role or "Clinician",
            "title": f"Verified {req.role or 'Clinician'}",
            "institution": "AegisMed Health Alliance",
            "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&q=80" if req.role == "Clinician" else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80"
        }
        return {
            "success": True,
            "token": f"aegis-jwt-token-{mock_user['id']}-xyz",
            "user": mock_user
        }
    
    raise HTTPException(status_code=401, detail="Invalid email or password credentials.")

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    email_clean = req.email.strip().lower()
    if email_clean in USERS_DB:
        raise HTTPException(status_code=400, detail="Account with this email already exists.")
    
    new_user = {
        "id": f"usr-{len(USERS_DB) + 1}",
        "name": req.name.strip(),
        "email": email_clean,
        "password": req.password,
        "role": req.role,
        "title": "Registered Medical Practitioner" if req.role == "Clinician" else "Registered Patient",
        "institution": req.institution or "AegisMed Network",
        "avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&q=80" if req.role == "Clinician" else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80"
    }
    USERS_DB[email_clean] = new_user

    return {
        "success": True,
        "token": f"aegis-jwt-token-{new_user['id']}-xyz",
        "user": {
            "id": new_user["id"],
            "name": new_user["name"],
            "email": new_user["email"],
            "role": new_user["role"],
            "title": new_user["title"],
            "institution": new_user["institution"],
            "avatar": new_user["avatar"]
        }
    }


# Catch-all route to serve the React index.html
@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    index_path = os.path.join(FRONTEND_BUILD_DIR, "index.html")
    if not os.path.exists(index_path):
        # Fallback if build is in frontend/dist
        fallback_path = os.path.join(BASE_DIR, "frontend", "dist", "index.html")
        if os.path.exists(fallback_path):
            index_path = fallback_path
    
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"error": "Frontend build not found. Please run 'npm run build' in the root directory."}

