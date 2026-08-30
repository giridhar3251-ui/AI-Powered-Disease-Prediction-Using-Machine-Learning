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

hospital_prefixes = ["Advanced", "Cura", "Apex", "Premier", "Elite", "Prime", "Medanta", "Max", "Aster", "Star", "Narayana", "Gem"]
hospital_suffixes = ["Specialty Hospital", "Research Institute", "Super Specialty Center", "Health City", "Medical Academy"]

new_hospitals = 0
for d in districts:
    # Add 10 more hospitals per district covering all diseases and specialties
    for _ in range(10):
        h_name = f"{random.choice(hospital_prefixes)} {random.choice(hospital_suffixes)} {d}"
        
        # Give this hospital 5 to 12 random specialties/diseases to ensure it hits
        hosp_specs = random.sample(specialists, k=random.randint(2, 6)) + random.sample(diseases, k=random.randint(3, 8))
        
        dummy_hospital = {
            "id": "hosp-adv-" + str(uuid.uuid4())[:8],
            "name": h_name,
            "district": d,
            "address": f"Block {random.randint(1, 20)}, Health Zone, {d}",
            "rating": round(random.uniform(4.0, 5.0), 1),
            "reviews_count": random.randint(100, 3000),
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
            "specialties": hosp_specs,
            "branches": []
        }
        data["hospitals"].append(dummy_hospital)
        new_hospitals += 1

with open(data_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)

print(f"Added {new_hospitals} advanced super-specialty hospitals to the database.")
