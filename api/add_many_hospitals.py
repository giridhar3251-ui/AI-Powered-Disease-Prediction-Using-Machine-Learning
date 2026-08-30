import json
import uuid
import os
import random

data_path = os.path.join("data", "tn_districts.json")
with open(data_path, "r", encoding="utf-8") as f:
    data = json.load(f)

districts = data.get('districts', [])
specialties = [
    "General Physician", "Emergency Services", "Ophthalmologist", 
    "Dermatologist", "Cardiologist", "Neurologist", "Orthopedist",
    "Pediatrician", "Gynecologist", "Oncologist", "Gastroenterologist",
    "Urologist", "Psychiatrist", "Endocrinologist", "Pulmonologist"
]

hospital_prefixes = ["Apollo", "Fortis", "Manipal", "Kaveri", "Global", "City", "Metro", "Care", "Life", "Health", "SRM", "CMC"]
hospital_suffixes = ["Hospital", "Medical Center", "Clinic", "Healthcare", "Specialty Hospital"]

new_hospitals = 0
for d in districts:
    # Add 5 hospitals per district
    for _ in range(5):
        h_name = f"{random.choice(hospital_prefixes)} {random.choice(hospital_suffixes)} {d}"
        dummy_hospital = {
            "id": "hosp-" + str(uuid.uuid4())[:8],
            "name": h_name,
            "district": d,
            "address": f"{random.randint(1, 100)} Main Road, {d} City Center, {d}",
            "rating": round(random.uniform(3.5, 5.0), 1),
            "reviews_count": random.randint(50, 1000),
            "phone": f"+91 9{random.randint(100000000, 999999999)}",
            "open_now": True,
            "hours": {
                "Monday": "24 Hours",
                "Tuesday": "24 Hours",
                "Wednesday": "24 Hours",
                "Thursday": "24 Hours",
                "Friday": "24 Hours",
                "Saturday": "24 Hours",
                "Sunday": "24 Hours"
            },
            "holiday_note": None,
            "specialties": random.sample(specialties, k=random.randint(3, 8)),
            "branches": []
        }
        data["hospitals"].append(dummy_hospital)
        new_hospitals += 1

with open(data_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)

print(f"Added {new_hospitals} new hospitals to the database.")
