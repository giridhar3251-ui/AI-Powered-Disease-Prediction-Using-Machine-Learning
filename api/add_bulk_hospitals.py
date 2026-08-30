import json
import uuid
import os
import random
import sys

sys.path.append('.')
from index import SPECIALIST_MAP

data_path = os.path.join("data", "tn_districts.json")
with open(data_path, "r", encoding="utf-8") as f:
    data = json.load(f)

districts = data.get('districts', [])
diseases = list(SPECIALIST_MAP.keys())
specialists = list(set([d.get('specialist', '').split('/')[0].strip() for d in SPECIALIST_MAP.values()]))

hospital_prefixes = [
    "Advanced", "Cura", "Apex", "Premier", "Elite", "Prime", "Medanta", "Max", 
    "Aster", "Star", "Narayana", "Gem", "Apollo", "Fortis", "Manipal", "Kaveri", 
    "Global", "City", "Metro", "Care", "Life", "Health", "SRM", "CMC", "Government",
    "District", "Regional", "Trust", "Hope", "Lifeline", "Sunrise", "Healing"
]
hospital_suffixes = [
    "Specialty Hospital", "Research Institute", "Super Specialty Center", "Health City", 
    "Medical Academy", "Hospital", "Medical Center", "Clinic", "Healthcare", 
    "Nursing Home", "General Hospital", "Polyclinic"
]

new_hospitals = 0
for d in districts:
    # Add 100 more hospitals per district
    for i in range(100):
        h_name = f"{random.choice(hospital_prefixes)} {random.choice(hospital_suffixes)} {d} {i+1}"
        
        # Give this hospital random specialties/diseases
        hosp_specs = random.sample(specialists, k=random.randint(1, 4)) + random.sample(diseases, k=random.randint(1, 5))
        
        dummy_hospital = {
            "id": "hosp-bulk-" + str(uuid.uuid4())[:8],
            "name": h_name,
            "district": d,
            "address": f"{random.randint(1, 999)} {random.choice(['Main Road', 'Cross Street', 'Avenue', 'Boulevard', 'Layout'])}, {d}",
            "rating": round(random.uniform(2.5, 5.0), 1),
            "reviews_count": random.randint(10, 5000),
            "phone": f"+91 9{random.randint(100000000, 999999999)}",
            "open_now": random.choice([True, True, True, False]), # mostly open
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
            "specialties": list(set(hosp_specs)), # remove duplicates
            "branches": []
        }
        data["hospitals"].append(dummy_hospital)
        new_hospitals += 1

with open(data_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)

print(f"Added {new_hospitals} hospitals to the database.")
