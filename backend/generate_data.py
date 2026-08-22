import os
import json
import csv
import random

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "model")
IMG_TRAIN_DIR = os.path.join(BASE_DIR, "image_data", "train")
IMG_TEST_DIR = os.path.join(BASE_DIR, "image_data", "test")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(IMG_TRAIN_DIR, exist_ok=True)
os.makedirs(IMG_TEST_DIR, exist_ok=True)

SYMPTOMS = [
    "itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing", "shivering", "chills",
    "joint_pain", "stomach_pain", "acidity", "ulcers_on_tongue", "muscle_wasting", "vomiting",
    "burning_micturition", "spotting_ urination", "fatigue", "weight_gain", "anxiety",
    "cold_hands_and_feets", "mood_swings", "weight_loss", "restlessness", "lethargy",
    "patches_in_throat", "irregular_sugar_level", "cough", "high_fever", "sunken_eyes",
    "breathlessness", "sweating", "dehydration", "indigestion", "headache", "yellowish_skin",
    "dark_urine", "nausea", "loss_of_appetite", "pain_behind_the_eyes", "back_pain",
    "constipation", "abdominal_pain", "diarrhoea", "mild_fever", "yellow_urine",
    "yellowing_of_eyes", "acute_liver_failure", "fluid_overload", "swelling_of_stomach",
    "swelled_lymph_nodes", "malaise", "blurred_and_distorted_vision", "phlegm",
    "throat_irritation", "redness_of_eyes", "sinus_pressure", "runny_nose", "congestion",
    "chest_pain", "weakness_in_limbs", "fast_heart_rate", "pain_during_bowel_movements",
    "pain_in_anal_region", "bloody_stool", "irritation_in_anus", "neck_pain", "dizziness",
    "cramps", "bruising", "obesity", "swollen_legs", "swollen_blood_vessels",
    "puffy_face_and_eyes", "enlarged_thyroid", "brittle_nails", "swollen_extremeties",
    "excessive_hunger", "extra_marital_contacts", "drying_and_tingling_lips", "slurred_speech",
    "knee_pain", "hip_joint_pain", "muscle_weakness", "stiff_neck", "swelling_joints",
    "movement_stiffness", "spinning_movements", "loss_of_balance", "unsteadiness",
    "weakness_of_one_body_side", "loss_of_smell", "bladder_discomfort", "foul_smell_of urine",
    "continuous_feel_of_urine", "passage_of_gases", "internal_itching", "toxic_look_(typhos)",
    "depression", "irritability", "muscle_pain", "altered_sensorium", "red_spots_over_body",
    "belly_pain", "abnormal_menstruation", "dischromic _patches", "watering_from_eyes",
    "increased_appetite", "polyuria", "family_history", "mucoid_sputum", "rusty_sputum",
    "lack_of_concentration", "visual_disturbances", "receiving_blood_transfusion",
    "receiving_unsterile_injections", "coma", "stomach_bleeding", "distention_of_abdomen",
    "history_of_alcohol_consumption", "fluid_overload.1", "blood_in_sputum",
    "prominent_veins_on_calf", "palpitations", "painful_walking", "pus_filled_pimples",
    "blackheads", "scurring", "skin_peeling", "silver_like_dusting", "small_dents_in_nails",
    "inflammatory_nails", "blister", "red_sore_around_nose", "yellow_crust_ooze"
]

DISEASE_PROFILES = {
    "Fungal infection": ["itching", "skin_rash", "nodal_skin_eruptions", "dischromic _patches"],
    "Allergy": ["continuous_sneezing", "shivering", "chills", "watering_from_eyes"],
    "GERD": ["stomach_pain", "acidity", "ulcers_on_tongue", "vomiting", "cough", "chest_pain"],
    "Chronic cholestasis": ["itching", "vomiting", "yellowish_skin", "nausea", "loss_of_appetite", "abdominal_pain", "yellowing_of_eyes"],
    "Drug Reaction": ["itching", "skin_rash", "stomach_pain", "burning_micturition", "spotting_ urination"],
    "Peptic ulcer diseae": ["vomiting", "indigestion", "loss_of_appetite", "abdominal_pain", "passage_of_gases", "internal_itching"],
    "AIDS": ["muscle_wasting", "patches_in_throat", "high_fever", "extra_marital_contacts"],
    "Diabetes ": ["fatigue", "weight_loss", "restlessness", "lethargy", "irregular_sugar_level", "blurred_and_distorted_vision", "obesity", "excessive_hunger", "increased_appetite", "polyuria"],
    "Gastroenteritis": ["vomiting", "sunken_eyes", "dehydration", "diarrhoea"],
    "Bronchial Asthma": ["fatigue", "cough", "high_fever", "breathlessness", "family_history", "mucoid_sputum"],
    "Hypertension ": ["headache", "chest_pain", "dizziness", "loss_of_balance", "lack_of_concentration"],
    "Migraine": ["acidity", "indigestion", "headache", "blurred_and_distorted_vision", "excessive_hunger", "stiff_neck", "depression", "irritability", "visual_disturbances"],
    "Cervical spondylosis": ["back_pain", "neck_pain", "dizziness", "loss_of_balance"],
    "Paralysis (brain hemorrhage)": ["vomiting", "headache", "weakness_of_one_body_side", "altered_sensorium"],
    "Jaundice": ["itching", "vomiting", "fatigue", "weight_loss", "high_fever", "yellowish_skin", "dark_urine", "abdominal_pain"],
    "Malaria": ["chills", "vomiting", "high_fever", "sweating", "headache", "nausea", "muscle_pain"],
    "Chicken pox": ["itching", "skin_rash", "fatigue", "lethargy", "high_fever", "headache", "loss_of_appetite", "mild_fever", "swelled_lymph_nodes", "malaise", "red_spots_over_body"],
    "Dengue": ["skin_rash", "chills", "joint_pain", "vomiting", "fatigue", "high_fever", "headache", "nausea", "loss_of_appetite", "pain_behind_the_eyes", "back_pain", "muscle_pain", "red_spots_over_body"],
    "Typhoid": ["chills", "vomiting", "fatigue", "high_fever", "headache", "nausea", "constipation", "abdominal_pain", "diarrhoea", "toxic_look_(typhos)", "belly_pain"],
    "hepatitis A": ["joint_pain", "vomiting", "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite", "abdominal_pain", "diarrhoea", "mild_fever", "yellowing_of_eyes", "muscle_pain"],
    "Hepatitis B": ["itching", "fatigue", "lethargy", "yellowish_skin", "dark_urine", "loss_of_appetite", "abdominal_pain", "yellow_urine", "yellowing_of_eyes", "malaise", "receiving_blood_transfusion", "receiving_unsterile_injections"],
    "Hepatitis C": ["fatigue", "yellowish_skin", "nausea", "loss_of_appetite", "yellowing_of_eyes", "family_history"],
    "Hepatitis D": ["joint_pain", "vomiting", "fatigue", "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite", "abdominal_pain", "yellowing_of_eyes"],
    "Hepatitis E": ["joint_pain", "vomiting", "fatigue", "high_fever", "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite", "abdominal_pain", "yellowing_of_eyes", "acute_liver_failure", "coma", "stomach_bleeding"],
    "Alcoholic hepatitis": ["vomiting", "yellowish_skin", "abdominal_pain", "swelling_of_stomach", "distention_of_abdomen", "history_of_alcohol_consumption", "fluid_overload.1"],
    "Tuberculosis": ["chills", "vomiting", "fatigue", "weight_loss", "cough", "high_fever", "breathlessness", "sweating", "loss_of_appetite", "mild_fever", "phlegm", "swelled_lymph_nodes", "malaise", "blood_in_sputum"],
    "Common Cold": ["continuous_sneezing", "chills", "fatigue", "cough", "headache", "swelled_lymph_nodes", "malaise", "phlegm", "throat_irritation", "redness_of_eyes", "sinus_pressure", "runny_nose", "congestion", "chest_pain", "loss_of_smell", "muscle_pain"],
    "Pneumonia": ["chills", "fatigue", "cough", "high_fever", "breathlessness", "sweating", "malaise", "phlegm", "chest_pain", "fast_heart_rate", "rusty_sputum"],
    "Dimorphic hemmorhoids(piles)": ["constipation", "pain_during_bowel_movements", "pain_in_anal_region", "bloody_stool", "irritation_in_anus"],
    "Heart attack": ["vomiting", "breathlessness", "sweating", "chest_pain"],
    "Varicose veins": ["fatigue", "cramps", "bruising", "obesity", "swollen_legs", "swollen_blood_vessels", "prominent_veins_on_calf"],
    "Hypothyroidism": ["fatigue", "weight_gain", "cold_hands_and_feets", "mood_swings", "lethargy", "dizziness", "puffy_face_and_eyes", "enlarged_thyroid", "brittle_nails", "swollen_extremeties", "depression", "irritability", "abnormal_menstruation"],
    "Hyperthyroidism": ["fatigue", "mood_swings", "weight_loss", "restlessness", "sweating", "diarrhoea", "fast_heart_rate", "excessive_hunger", "muscle_weakness", "irritability", "abnormal_menstruation"],
    "Hypoglycemia": ["vomiting", "fatigue", "anxiety", "sweating", "headache", "nausea", "blurred_and_distorted_vision", "excessive_hunger", "drying_and_tingling_lips", "slurred_speech", "irritability", "palpitations"],
    "Osteoarthristis": ["joint_pain", "neck_pain", "knee_pain", "hip_joint_pain", "swelling_joints", "painful_walking"],
    "Arthritis": ["muscle_weakness", "stiff_neck", "swelling_joints", "movement_stiffness", "painful_walking"],
    "(vertigo) Paroymsal  Positional Vertigo": ["vomiting", "headache", "nausea", "spinning_movements", "loss_of_balance", "unsteadiness"],
    "Acne": ["skin_rash", "pus_filled_pimples", "blackheads", "scurring"],
    "Urinary tract infection": ["burning_micturition", "bladder_discomfort", "foul_smell_of urine", "continuous_feel_of_urine"],
    "Psoriasis": ["skin_rash", "joint_pain", "skin_peeling", "silver_like_dusting", "small_dents_in_nails", "inflammatory_nails"],
    "Impetigo": ["skin_rash", "high_fever", "blister", "red_sore_around_nose", "yellow_crust_ooze"],
    "COVID-19": ["high_fever", "cough", "breathlessness", "fatigue", "loss_of_smell", "headache", "throat_irritation", "muscle_pain"],
    "Appendicitis": ["belly_pain", "abdominal_pain", "vomiting", "nausea", "loss_of_appetite", "high_fever"],
    "Kidney Stones": ["back_pain", "burning_micturition", "spotting_ urination", "nausea", "vomiting", "foul_smell_of urine"],
    "Anemia": ["fatigue", "lethargy", "dizziness", "weakness_in_limbs", "cold_hands_and_feets", "palpitations"],
    "Influenza (Flu)": ["high_fever", "chills", "muscle_pain", "headache", "fatigue", "cough", "runny_nose"],
    "Gallstones": ["abdominal_pain", "belly_pain", "nausea", "vomiting", "indigestion", "yellowish_skin"],
    "Sinusitis": ["sinus_pressure", "headache", "runny_nose", "congestion", "cough", "patches_in_throat"],
    "Tonsillitis": ["throat_irritation", "patches_in_throat", "high_fever", "chills", "swelled_lymph_nodes"],
    "Acute Pancreatitis": ["abdominal_pain", "belly_pain", "vomiting", "nausea", "fast_heart_rate", "high_fever", "history_of_alcohol_consumption"],
    "Eczema": ["itching", "skin_rash", "red_spots_over_body", "dischromic _patches"],
    "Sciatica": ["back_pain", "knee_pain", "weakness_in_limbs", "painful_walking", "cramps"],
    "Gout": ["joint_pain", "knee_pain", "swelling_joints", "movement_stiffness", "painful_walking"],
    "Chronic Kidney Disease": ["swollen_legs", "swollen_extremeties", "fatigue", "lethargy", "nausea", "polyuria", "dark_urine"],
    "Non-Alcoholic Fatty Liver Disease": ["fatigue", "abdominal_pain", "obesity", "swelling_of_stomach", "distention_of_abdomen"],
    "Parkinson's Disease": ["spinning_movements", "loss_of_balance", "unsteadiness", "slurred_speech", "movement_stiffness", "muscle_weakness"],
    "Meningitis": ["high_fever", "stiff_neck", "headache", "vomiting", "altered_sensorium", "blurred_and_distorted_vision"],
    "Shingles": ["itching", "skin_rash", "blister", "burning_micturition", "red_spots_over_body"],
    "Conjunctivitis": ["redness_of_eyes", "watering_from_eyes", "blurred_and_distorted_vision", "itching"],
    "COPD": ["breathlessness", "cough", "phlegm", "fatigue", "chest_pain"],
    "Fibromyalgia": ["muscle_pain", "fatigue", "joint_pain", "lack_of_concentration", "depression", "anxiety", "mood_swings"],
    "Otitis Media": ["headache", "high_fever", "dizziness", "throat_irritation"],
    "Pulmonary Embolism": ["chest_pain", "breathlessness", "fast_heart_rate", "cough", "blood_in_sputum", "dizziness"],
    "Gastritis": ["stomach_pain", "acidity", "nausea", "vomiting", "indigestion", "loss_of_appetite"],
    "Systemic Lupus Erythematosus": ["skin_rash", "joint_pain", "fatigue", "high_fever", "red_spots_over_body", "swelling_joints"],
    "Rabies": ["high_fever", "headache", "altered_sensorium", "anxiety", "restlessness", "coma"],
    "Tetanus": ["stiff_neck", "muscle_weakness", "slurred_speech", "cramps", "high_fever"],
    "Sepsis": ["high_fever", "chills", "fast_heart_rate", "breathlessness", "altered_sensorium", "coma"],
    "Endocarditis": ["high_fever", "chills", "fatigue", "fast_heart_rate", "chest_pain", "palpitations"],
    "Glaucoma": ["visual_disturbances", "blurred_and_distorted_vision", "pain_behind_the_eyes", "headache"],
    "Cataract": ["blurred_and_distorted_vision", "visual_disturbances", "loss_of_balance"],
    "Deep Vein Thrombosis": ["swollen_legs", "cramps", "swollen_blood_vessels", "prominent_veins_on_calf", "painful_walking"],
    "Irritable Bowel Syndrome": ["stomach_pain", "abdominal_pain", "diarrhoea", "constipation", "passage_of_gases", "belly_pain"]
}

random.seed(42)
training_rows = []
testing_rows = []

for disease, symptoms in DISEASE_PROFILES.items():
    for _ in range(120):
        row = {s: 0 for s in SYMPTOMS}
        k = random.randint(max(1, len(symptoms)-2), len(symptoms))
        selected = random.sample(symptoms, k)
        for s in selected:
            row[s] = 1
        row["prognosis"] = disease
        training_rows.append(row)

    test_row = {s: 0 for s in SYMPTOMS}
    for s in symptoms:
        test_row[s] = 1
    test_row["prognosis"] = disease
    testing_rows.append(test_row)

fieldnames = SYMPTOMS + ["prognosis"]
with open(os.path.join(DATA_DIR, "Training.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(training_rows)

with open(os.path.join(DATA_DIR, "Testing.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(testing_rows)

print(f"Generated Training.csv ({len(training_rows)}) and Testing.csv ({len(testing_rows)})")

DESCRIPTIONS = {
    "Fungal infection": "A fungal infection is a skin disease caused by a fungus. It can affect any area of the body and commonly causes redness, itching, and scaling.",
    "Allergy": "An allergy is an immune system response to a foreign substance not typically harmful to your body, triggering sneezing, hives, or watery eyes.",
    "GERD": "Gastroesophageal reflux disease occurs when stomach acid repeatedly flows back into the tube connecting your mouth and stomach, causing heartburn and acid regurgitation.",
    "Chronic cholestasis": "Chronic cholestasis is a condition where bile flow from the liver is reduced or blocked for an extended period, leading to jaundice and pruritus.",
    "Drug Reaction": "An adverse drug reaction is an unwanted or unexpected symptom that occurs following the intake of a prescription medication or over-the-counter drug.",
    "Peptic ulcer diseae": "Peptic ulcers are open sores that develop on the inside lining of your stomach and the upper portion of your small intestine.",
    "AIDS": "Acquired immunodeficiency syndrome is a chronic condition caused by the human immunodeficiency virus that severely impairs the immune system.",
    "Diabetes ": "Diabetes mellitus is a metabolic disease that causes high blood sugar levels due to inadequate insulin production or cellular insulin resistance.",
    "Gastroenteritis": "Gastroenteritis is an inflammation of the lining of the intestines caused by a virus, bacteria, or parasites, commonly causing diarrhea and vomiting.",
    "Bronchial Asthma": "Bronchial asthma is a chronic inflammatory disorder of the airways causing recurring episodes of wheezing, breathlessness, and coughing.",
    "Hypertension ": "Hypertension is a chronic medical condition in which the blood pressure in the arteries is persistently elevated, increasing cardiovascular risk.",
    "Migraine": "A migraine is a headache of varying intensity, often accompanied by nausea, sensitivity to light and sound, and visual aura.",
    "Cervical spondylosis": "Cervical spondylosis is an age-related wear-and-tear of the spinal disks in your neck that can cause neck stiffness, pain, and numbness.",
    "Paralysis (brain hemorrhage)": "Paralysis following a cerebral hemorrhage occurs when bleeding within the brain tissue disrupts motor control signals to one side of the body.",
    "Jaundice": "Jaundice is a yellow discoloration of the skin, mucous membranes, and sclera caused by elevated levels of bilirubin in the blood.",
    "Malaria": "Malaria is a life-threatening disease caused by Plasmodium parasites that are transmitted to people through the bites of infected female Anopheles mosquitoes.",
    "Chicken pox": "Chickenpox is a highly contagious viral infection caused by the varicella-zoster virus, characterized by itchy blisters and fever.",
    "Dengue": "Dengue is a mosquito-borne viral infection causing a severe flu-like illness, high fever, retro-orbital headache, joint pain, and characteristic rash.",
    "Typhoid": "Typhoid fever is a life-threatening bacterial infection caused by Salmonella Typhi, presenting with prolonged fever, fatigue, headache, and abdominal pain.",
    "hepatitis A": "Hepatitis A is an acute infectious disease of the liver caused by the hepatitis A virus, typically spread through contaminated food or water.",
    "Hepatitis B": "Hepatitis B is a serious liver infection caused by the hepatitis B virus that can become chronic and lead to cirrhosis or liver cancer.",
    "Hepatitis C": "Hepatitis C is a viral infection that causes liver inflammation, often leading to significant long-term liver damage if untreated.",
    "Hepatitis D": "Hepatitis D is a liver disease caused by the hepatitis D virus, which only occurs in individuals who are already infected with hepatitis B.",
    "Hepatitis E": "Hepatitis E is a liver disease caused by the hepatitis E virus, mainly transmitted through contaminated drinking water.",
    "Alcoholic hepatitis": "Alcoholic hepatitis is severe inflammation of the liver caused by long-term excessive alcohol consumption.",
    "Tuberculosis": "Tuberculosis is an infectious disease caused by Mycobacterium tuberculosis bacteria that primarily affects the lungs and spreads through respiratory droplets.",
    "Common Cold": "The common cold is a viral infectious disease of the upper respiratory tract that primarily affects the nose, throat, and sinuses.",
    "Pneumonia": "Pneumonia is an inflammatory condition of the lung affecting primarily the microscopic air sacs known as alveoli, often caused by bacterial or viral infection.",
    "Dimorphic hemmorhoids(piles)": "Hemorrhoids are swollen veins in your anus and lower rectum, which can cause pain, itching, and rectal bleeding during bowel movements.",
    "Heart attack": "A myocardial infarction (heart attack) occurs when blood flow decreases or stops to a part of the heart, causing damage to the heart muscle.",
    "Varicose veins": "Varicose veins are twisted, enlarged veins, most commonly appearing in the legs and feet due to weakened vein valves.",
    "Hypothyroidism": "Hypothyroidism is a condition where the thyroid gland does not produce enough thyroid hormone, leading to fatigue, weight gain, and cold intolerance.",
    "Hyperthyroidism": "Hyperthyroidism occurs when the thyroid gland produces too much thyroxine hormone, causing rapid weight loss, heat intolerance, and rapid heart rate.",
    "Hypoglycemia": "Hypoglycemia is a condition characterized by abnormally low blood glucose levels, leading to shakiness, sweating, confusion, and dizziness.",
    "Osteoarthristis": "Osteoarthritis is the most common form of arthritis, characterized by the breakdown of joint cartilage and underlying bone.",
    "Arthritis": "Arthritis is the swelling and tenderness of one or more joints, causing joint pain, stiffness, and restricted mobility.",
    "(vertigo) Paroymsal  Positional Vertigo": "Benign paroxysmal positional vertigo (BPPV) is a disorder arising from the inner ear characterized by brief episodes of spinning sensations triggered by head movement.",
    "Acne": "Acne vulgaris is a long-term skin condition that occurs when hair follicles become clogged with dead skin cells and oil, producing pimples and blackheads.",
    "Urinary tract infection": "A urinary tract infection is an infection in any part of the urinary system, including kidneys, ureters, bladder, and urethra.",
    "Psoriasis": "Psoriasis is an autoimmune skin disease that causes cells to build up rapidly on the skin surface, forming itchy, silver-scaled patches.",
    "Impetigo": "Impetigo is a highly contagious bacterial skin infection that causes red sores that can break open, ooze fluid, and develop a yellow-brown crust.",
    "COVID-19": "COVID-19 is a contagious respiratory illness caused by the SARS-CoV-2 coronavirus, leading to fever, dry cough, dyspnea, fatigue, and loss of taste or smell.",
    "Appendicitis": "Appendicitis is acute inflammation of the vermiform appendix, presenting with sudden right lower quadrant abdominal pain, nausea, vomiting, and fever.",
    "Kidney Stones": "Kidney stones are hard crystalline mineral deposits formed inside the renal pelvis, causing severe flank pain, hematuria, and dysuria.",
    "Anemia": "Anemia is a hematological disorder marked by a deficiency of red blood cells or hemoglobin, causing chronic fatigue, dizziness, and pallor.",
    "Influenza (Flu)": "Influenza is a viral infection of the respiratory tract characterized by acute onset of high fever, myalgia, headache, and severe malaise.",
    "Gallstones": "Gallstones are hardened deposits of digestive fluid in the gallbladder that block bile ducts and trigger severe right upper quadrant abdominal pain.",
    "Sinusitis": "Sinusitis is inflammation of the paranasal mucosal lining causing facial congestion, headache, sinus pressure, and purulent nasal discharge.",
    "Tonsillitis": "Tonsillitis is inflammation of the pharyngeal tonsils usually caused by viral or streptococcal infection, resulting in odynophagia and fever.",
    "Acute Pancreatitis": "Acute pancreatitis is sudden inflammation of the pancreas marked by severe epigastric pain radiating to the back, nausea, and enzyme elevation.",
    "Eczema": "Eczema is a chronic inflammatory skin disease producing dry, erythematous, pruritic, and scaly patches across various body regions.",
    "Sciatica": "Sciatica is nerve compression or irritation of the sciatic nerve root, causing sharp shooting pain radiating down the lower limb.",
    "Gout": "Gout is a painful metabolic arthritis caused by monosodium urate crystal deposition in joints, causing sudden joint redness and swelling.",
    "Chronic Kidney Disease": "Chronic Kidney Disease is progressive irreversible deterioration of renal function over months or years, leading to fluid overload and uremia.",
    "Non-Alcoholic Fatty Liver Disease": "NAFLD is hepatic steatosis not caused by excessive alcohol consumption, strongly linked to central obesity and insulin resistance.",
    "Parkinson's Disease": "Parkinson's disease is a neurodegenerative movement disorder marked by resting tremor, bradykinesia, muscular rigidity, and gait instability.",
    "Meningitis": "Meningitis is an emergency inflammatory infection of the leptomeninges surrounding the brain and spinal cord, presenting with nuchal rigidity and fever.",
    "Shingles": "Shingles is a localized reactivation of latent varicella-zoster virus in a nerve ganglion, producing a painful dermatomal vesicular eruption.",
    "Conjunctivitis": "Conjunctivitis is inflammation of the conjunctival membrane of the eye, presenting with ocular hyperopia, tearing, and itching.",
    "COPD": "COPD is a progressive pulmonary condition causing chronic airflow limitation, persistent cough, dyspnea, and sputum production.",
    "Fibromyalgia": "Fibromyalgia is a chronic pain disorder characterized by widespread musculoskeletal aching, fatigue, sleep disturbance, and cognitive dysfunction.",
    "Otitis Media": "Otitis media is inflammation of the middle ear cleft, presenting with otalgia, fever, conductive hearing impairment, and irritability.",
    "Pulmonary Embolism": "Pulmonary embolism is an acute occlusion of the pulmonary arterial bed by a thrombus, causing sudden dyspnea, pleuritic chest pain, and tachycardia.",
    "Gastritis": "Gastritis is mucosal inflammation of the stomach lining caused by H. pylori, alcohol, or NSAIDs, resulting in epigastric burning and indigestion.",
    "Systemic Lupus Erythematosus": "Lupus is a systemic autoimmune disease where autoantibodies cause widespread tissue damage in joints, skin, kidneys, and vasculature.",
    "Rabies": "Rabies is a fatal viral zoonotic encephalitis transmitted via animal bites, causing agitation, hydrophobia, paralysis, and altered sensorium.",
    "Tetanus": "Tetanus is a neurological disease caused by Clostridium tetani neurotoxin, producing trismus (lockjaw), painful muscle spasms, and autonomic instability.",
    "Sepsis": "Sepsis is a life-threatening systemic organ dysfunction caused by a dysregulated host response to severe bacterial or viral infection.",
    "Endocarditis": "Infective endocarditis is a dangerous bacterial infection of the endocardium and cardiac valves, producing fever, heart murmurs, and embolic phenomena.",
    "Glaucoma": "Glaucoma is an optic neuropathy causing progressive peripheral visual field loss, often associated with elevated intraocular pressure.",
    "Cataract": "Cataract is progressive opacification of the ocular lens, leading to painless reduction in visual acuity, glare, and impaired color perception.",
    "Deep Vein Thrombosis": "Deep Vein Thrombosis is thrombus formation within deep veins of the lower extremities, causing localized edema, erythema, and leg tenderness.",
    "Irritable Bowel Syndrome": "Irritable Bowel Syndrome is a functional gastrointestinal disorder marked by recurrent abdominal pain linked to altered bowel frequency or stool form."
}

with open(os.path.join(DATA_DIR, "symptom_description.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Disease", "Description"])
    for dis, desc in DESCRIPTIONS.items():
        writer.writerow([dis, desc])

PRECAUTIONS = {
    "Fungal infection": ["stop open air bathing", "use clean dry towels and clothing", "apply antifungal powder/cream", "consult dermatologist if symptoms persist"],
    "Allergy": ["apply calamine lotion", "avoid known allergens and dusty areas", "use prescribed antihistamines", "keep windows closed during high pollen counts"],
    "GERD": ["avoid fatty and spicy foods", "do not lie down immediately after eating", "eat smaller, frequent meals", "elevate the head of your bed during sleep"],
    "Chronic cholestasis": ["take cold baths to relieve itching", "avoid alcohol and high fat foods", "consult hepatologist promptly", "eat anti-inflammatory and fiber-rich meals"],
    "Drug Reaction": ["stop taking the suspected medication immediately", "consult prescribing physician or emergency care", "stay well hydrated", "follow up with allergy testing"],
    "Peptic ulcer diseae": ["avoid spicy and acidic foods", "consume probiotic foods and yogurt", "avoid NSAID pain relievers", "take prescribed acid blockers as advised"],
    "AIDS": ["avoid infected body fluids", "adhere strictly to prescribed antiretroviral therapy", "follow a nutritious high-protein diet", "maintain strict personal hygiene to prevent infections"],
    "Diabetes ": ["monitor blood sugar levels daily", "exercise regularly for at least 30 minutes", "maintain a low glycemic balanced diet", "take prescribed insulin or oral hypoglycemics consistently"],
    "Gastroenteritis": ["drink oral rehydration solutions (ORS)", "eat bland foods like bananas, rice, and toast", "avoid dairy, caffeine, and greasy meals", "rest adequately and wash hands frequently"],
    "Bronchial Asthma": ["use prescribed rescue and maintenance inhalers", "avoid cold air, dust, and smoke triggers", "keep an asthma action plan ready", "practice deep breathing exercises"],
    "Hypertension ": ["reduce dietary sodium and salt intake", "exercise and walk briskly for 30 minutes daily", "manage stress through meditation or relaxation", "take antihypertensive medications as prescribed"],
    "Migraine": ["rest in a quiet and dark room", "apply cold compresses to forehead or temples", "stay well hydrated and maintain regular sleep schedules", "avoid known food triggers like aged cheese or caffeine"],
    "Cervical spondylosis": ["use an ergonomic cervical pillow", "perform gentle neck stretching exercises", "avoid prolonged downward head tilting on screens", "consult a physiotherapist for posture alignment"],
    "Paralysis (brain hemorrhage)": ["seek immediate emergency neurological evaluation", "begin physical and occupational rehabilitation", "strictly control blood pressure levels", "ensure safe swallowing and fall prevention"],
    "Jaundice": ["consume a light, easily digestible carbohydrate diet", "drink plenty of boiled clean water and fresh fluids", "avoid oily, fried, and heavy foods completely", "get regular liver function tests (LFT)"],
    "Malaria": ["complete the full course of prescribed antimalarials", "use mosquito nets and insect repellent", "stay hydrated with electrolytes and soups", "avoid water stagnation around living areas"],
    "Chicken pox": ["apply soothing calamine lotion to blisters", "do not scratch pox lesions to prevent secondary infection", "take lukewarm oatmeal baths", "isolate to avoid spreading virus to susceptible individuals"],
    "Dengue": ["drink plenty of fluids and papaya leaf extract/ORS", "avoid aspirin and NSAID painkillers (use paracetamol only)", "monitor platelet counts closely every 24 hours", "seek hospitalization if bleeding or severe abdominal pain occurs"],
    "Typhoid": ["eat soft, bland, and easily digestible foods", "drink only boiled and purified water", "complete the entire course of prescribed antibiotics", "wash hands thoroughly before eating"],
    "hepatitis A": ["consult doctor for liver care protocol", "consume clean, hygienic boiled water and home-cooked food", "avoid alcohol and hepatotoxic substances", "rest adequately during acute phase"],
    "Hepatitis B": ["consult a gastroenterologist/hepatologist", "ensure family members receive Hepatitis B vaccination", "avoid sharing razors, toothbrushes, or needles", "maintain regular viral load monitoring"],
    "Hepatitis C": ["consult hepatologist for direct-acting antivirals", "avoid alcohol completely", "maintain a healthy liver-friendly diet", "get regular hepatic ultrasounds and screenings"],
    "Hepatitis D": ["follow hepatology specialist recommendations", "treat underlying Hepatitis B infection diligently", "avoid hepatotoxic medications", "maintain high nutrition and hydration"],
    "Hepatitis E": ["drink strictly boiled or filtered water", "rest adequately and avoid strenuous physical exertion", "maintain strict food and hand hygiene", "monitor liver enzymes under medical supervision"],
    "Alcoholic hepatitis": ["stop alcohol consumption completely and permanently", "consume high-protein, vitamin-rich nutritious meals", "consult a hepatologist for liver regeneration care", "participate in supportive rehabilitation programs"],
    "Tuberculosis": ["cover mouth and nose with a mask when coughing", "take full DOTS antibiotic regimen without missing any dose", "consume a high-calorie, protein-rich diet", "ensure proper ventilation in living spaces"],
    "Common Cold": ["drink warm fluids, herbal teas, and soups", "take steam inhalations with eucalyptus oil", "get sufficient sleep and physical rest", "use saline nasal drops for nasal congestion"],
    "Pneumonia": ["seek prompt medical consultation and chest X-ray", "complete prescribed antibiotic or antiviral therapy", "rest in an upright position to ease breathing", "stay well hydrated to help clear secretions"],
    "Dimorphic hemmorhoids(piles)": ["increase dietary fiber intake with fruits and vegetables", "drink at least 2.5 to 3 liters of water daily", "take warm sitz baths for 15 minutes twice daily", "avoid straining during bowel movements"],
    "Heart attack": ["call emergency medical services (108/911) immediately", "chew an aspirin 300mg if not allergic while waiting", "keep patient calm in a semi-upright seated position", "avoid exertion or walking"],
    "Varicose veins": ["wear graduated compression stockings", "elevate legs above heart level when resting", "avoid prolonged continuous standing or sitting", "engage in low-impact leg exercises like walking and swimming"],
    "Hypothyroidism": ["take levothyroxine hormone on an empty stomach in the morning", "consume iodine and selenium adequate foods", "engage in regular cardiovascular exercise", "test TSH levels every 3 to 6 months"],
    "Hyperthyroidism": ["take antithyroid medications consistently as prescribed", "avoid excessive caffeine, stimulants, and iodine supplements", "consume adequate calories to offset high metabolism", "monitor heart rate and thyroid panel regularly"],
    "Hypoglycemia": ["consume 15-20g of fast-acting glucose (fruit juice/candy)", "recheck blood sugar levels after 15 minutes", "eat a balanced complex carbohydrate snack once normalized", "consult endocrinologist to adjust medication dosages"],
    "Osteoarthristis": ["engage in low-impact joint exercises like swimming", "maintain a healthy body weight to reduce joint load", "apply warm or cold packs to painful joints", "consult an orthopedic specialist for physical therapy"],
    "Arthritis": ["perform gentle range-of-motion exercises daily", "maintain anti-inflammatory diet rich in omega-3s", "use supportive braces or walking aids if recommended", "consult a rheumatologist for disease-modifying therapies"],
    "(vertigo) Paroymsal  Positional Vertigo": ["perform Epley maneuver under specialist guidance", "avoid sudden head movements and rapid standing", "sit down immediately when sensation of spinning occurs", "sleep with head slightly elevated on two pillows"],
    "Acne": ["cleanse face gently twice daily with mild salicylic acid cleanser", "avoid squeezing or picking at pimples", "use non-comedogenic and oil-free skincare products", "apply topical benzoyl peroxide or consult dermatologist"],
    "Urinary tract infection": ["drink plenty of water (at least 3 liters daily)", "consume unsweetened cranberry juice or urinary alkalizers", "complete the full course of prescribed antibiotics", "do not hold urine for extended periods"],
    "Psoriasis": ["apply prescribed topical moisturizers and corticosteroids", "get moderate, safe sun exposure under doctor guidance", "avoid stress, alcohol, and skin injury triggers", "consult a dermatologist for systemic or biologic treatments"],
    "Impetigo": ["clean sores gently with antibacterial soap and warm water", "apply prescribed mupirocin antibiotic ointment", "keep affected area covered with sterile gauze", "wash hands and patient's towels separately in hot water"],
    "COVID-19": ["isolate in a well-ventilated room", "monitor blood oxygen saturation (SpO2) every 6 hours", "maintain high fluid intake and bed rest", "consult doctor if SpO2 drops below 94%"],
    "Appendicitis": ["seek immediate emergency surgical evaluation", "do not consume food or water until evaluated", "avoid taking laxatives or hot compresses", "rest in a comfortable semi-Fowler position"],
    "Kidney Stones": ["drink 3 to 4 liters of clean water daily", "consult a urologist for non-contrast CT/ultrasound", "reduce dietary sodium and high-oxalate foods", "take prescribed stone dissolution medications"],
    "Anemia": ["consume iron-rich foods like dark leafy greens and legumes", "take oral iron supplements with Vitamin C", "avoid tea or coffee during meal times", "check complete blood count (CBC) regularly"],
    "Influenza (Flu)": ["get adequate physical rest and stay warm", "drink electrolyte fluids and warm broths", "take prescribed antiviral medication within 48 hours", "cover mouth when sneezing and wear mask"],
    "Gallstones": ["avoid high-fat, deep-fried, and creamy foods", "eat high-fiber meals with healthy lean proteins", "seek emergency care if biliary pain exceeds 2 hours", "consult general surgeon for ultrasound review"],
    "Sinusitis": ["perform steam inhalation with eucalyptus oil twice daily", "use saline nasal irrigation 3-4 times daily", "stay hydrated to thin mucous secretions", "apply warm compress over sinus areas"],
    "Tonsillitis": ["gargle with warm salt water 4 times daily", "drink warm soothing liquids like honey tea", "consume soft, non-irritating, easy-to-swallow foods", "complete full course of prescribed antibiotics"],
    "Acute Pancreatitis": ["seek emergency hospital admission immediately", "refrain from oral food and alcohol intake", "receive IV hydration and pain control in hospital", "follow strict low-fat diet post-recovery"],
    "Eczema": ["apply thick fragrance-free moisturizer after bathing", "avoid harsh synthetic soaps and hot showers", "wear soft breathable 100% cotton clothing", "use prescribed topical corticosteroid during flare-ups"],
    "Sciatica": ["apply cold/heat therapy packs to lower back", "avoid prolonged sitting or heavy bending", "perform gentle sciatic nerve glides under guidance", "use ergonomic lumbar support pillow"],
    "Gout": ["drink at least 3 liters of water daily", "avoid purine-rich foods like red meat and organ meats", "avoid alcohol and high-fructose corn syrup", "elevate affected joint and apply ice during flare"],
    "Chronic Kidney Disease": ["strictly monitor blood pressure and blood sugar", "reduce dietary salt, potassium, and protein intake", "avoid over-the-counter NSAID painkillers", "consult nephrologist for routine GFR evaluation"],
    "Non-Alcoholic Fatty Liver Disease": ["engage in 150 minutes of weekly aerobic exercise", "adopt a Mediterranean diet high in vegetables and fiber", "gradually reduce 7-10% of total body weight", "avoid refined sugars and sugary beverages"],
    "Parkinson's Disease": ["engage in regular physical therapy and gait training", "install bathroom grab bars and clear floor rugs", "maintain high-fiber diet to prevent constipation", "take dopaminergic medications strictly on schedule"],
    "Meningitis": ["seek immediate emergency room evaluation", "start IV broad-spectrum antibiotics without delay", "isolate patient to prevent droplet transmission", "ensure vaccination against bacterial meningitis"],
    "Shingles": ["start oral antiviral therapy within 72 hours of rash", "keep blistering rash clean, cool, and dry", "avoid contact with infants and pregnant women", "apply cool compresses to soothe skin burning"],
    "Conjunctivitis": ["avoid touching or rubbing infected eyes", "wash hands frequently with soap and water", "use separate clean towels and change pillowcases daily", "discontinue contact lens wear until resolved"],
    "COPD": ["stop smoking completely and avoid secondhand smoke", "use daily maintenance and rescue bronchodilators", "participate in pulmonary rehabilitation exercises", "receive annual flu and pneumococcal vaccines"],
    "Fibromyalgia": ["engage in regular low-impact aerobic exercise", "maintain consistent sleep schedule and hygiene", "practice mindfulness and stress management", "pace physical activities to prevent exhaustion"],
    "Otitis Media": ["keep affected ear completely dry during bathing", "avoid inserting cotton swabs into ear canal", "use warm compress on external ear for pain relief", "complete full antibiotic course if prescribed"],
    "Pulmonary Embolism": ["call emergency medical services (108/911) immediately", "avoid long periods of continuous immobility", "wear graduated compression stockings during travel", "take anticoagulant blood thinners as prescribed"],
    "Gastritis": ["avoid NSAID painkillers, alcohol, and smoking", "eat small, frequent, non-spicy balanced meals", "avoid caffeine and acidic citrus beverages", "take prescribed proton pump inhibitor before meals"],
    "Systemic Lupus Erythematosus": ["wear broad-spectrum SPF 50+ sunscreen daily", "get adequate rest to manage chronic fatigue", "avoid direct sunlight and UV radiation exposure", "monitor renal function with routine urinalysis"],
    "Rabies": ["wash animal bite wounds with soap and running water for 15 min", "receive rabies post-exposure prophylaxis (PEP) vaccine immediately", "administer rabies immunoglobulin into wound site", "vaccinate domestic dogs and cats regularly"],
    "Tetanus": ["clean dirty, puncture, or animal wounds thoroughly", "receive Tetanus toxoid booster every 10 years", "seek emergency care for deep contaminated wounds", "administer Tetanus Immunoglobulin (TIG) if unimmunized"],
    "Sepsis": ["seek emergency room care (108/911) immediately", "receive IV broad-spectrum antibiotics within 1 hour", "monitor blood pressure, oxygen, and urine output", "treat underlying source of infection promptly"],
    "Endocarditis": ["maintain strict oral and dental hygiene", "take prophylactic antibiotics before dental work if cardiac risk", "seek prompt treatment for skin infections or boils", "receive full IV antibiotic course in hospital"],
    "Glaucoma": ["undergo comprehensive dilated eye exams regularly", "instill intraocular pressure lowering eye drops daily", "avoid inverted head-down exercise positions", "protect eyes from physical trauma"],
    "Cataract": ["wear UV-blocking polarized sunglasses outdoors", "use bright directed task lighting for reading", "maintain regular optometric prescription checks", "consult ophthalmologist for phacoemulsification surgery"],
    "Deep Vein Thrombosis": ["wear graduated medical compression stockings", "avoid continuous prolonged standing or sitting", "perform leg calf pump exercises while seated", "take prescribed oral anticoagulant medications strictly"],
    "Irritable Bowel Syndrome": ["follow a low-FODMAP diet under dietitian guidance", "keep a food diary to identify specific symptom triggers", "practice regular stress reduction and exercise", "increase dietary soluble fiber gradually"]
}

with open(os.path.join(DATA_DIR, "symptom_precaution.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Disease", "Precaution_1", "Precaution_2", "Precaution_3", "Precaution_4"])
    for dis, pre_list in PRECAUTIONS.items():
        row = [dis] + (pre_list + ["", "", "", ""])[:4]
        writer.writerow(row)

SEVERITY_MAP = {
    "itching": 1, "skin_rash": 3, "nodal_skin_eruptions": 4, "continuous_sneezing": 4, "shivering": 5, "chills": 3,
    "joint_pain": 3, "stomach_pain": 5, "acidity": 3, "ulcers_on_tongue": 4, "muscle_wasting": 3, "vomiting": 5,
    "burning_micturition": 6, "spotting_ urination": 6, "fatigue": 4, "weight_gain": 3, "anxiety": 4,
    "cold_hands_and_feets": 5, "mood_swings": 3, "weight_loss": 3, "restlessness": 5, "lethargy": 2,
    "patches_in_throat": 6, "irregular_sugar_level": 5, "cough": 4, "high_fever": 7, "sunken_eyes": 3,
    "breathlessness": 4, "sweating": 3, "dehydration": 4, "indigestion": 5, "headache": 3, "yellowish_skin": 3,
    "dark_urine": 4, "nausea": 5, "loss_of_appetite": 4, "pain_behind_the_eyes": 4, "back_pain": 3,
    "constipation": 4, "abdominal_pain": 4, "diarrhoea": 6, "mild_fever": 5, "yellow_urine": 4,
    "yellowing_of_eyes": 4, "acute_liver_failure": 6, "fluid_overload": 6, "swelling_of_stomach": 7,
    "swelled_lymph_nodes": 6, "malaise": 6, "blurred_and_distorted_vision": 5, "phlegm": 5,
    "throat_irritation": 4, "redness_of_eyes": 5, "sinus_pressure": 4, "runny_nose": 5, "congestion": 5,
    "chest_pain": 7, "weakness_in_limbs": 7, "fast_heart_rate": 5, "pain_during_bowel_movements": 5,
    "pain_in_anal_region": 6, "bloody_stool": 5, "irritation_in_anus": 6, "neck_pain": 5, "dizziness": 4,
    "cramps": 5, "bruising": 4, "obesity": 4, "swollen_legs": 5, "swollen_blood_vessels": 5,
    "puffy_face_and_eyes": 5, "enlarged_thyroid": 6, "brittle_nails": 5, "swollen_extremeties": 5,
    "excessive_hunger": 4, "extra_marital_contacts": 5, "drying_and_tingling_lips": 4, "slurred_speech": 4,
    "knee_pain": 3, "hip_joint_pain": 2, "muscle_weakness": 2, "stiff_neck": 4, "swelling_joints": 5,
    "movement_stiffness": 5, "spinning_movements": 6, "loss_of_balance": 4, "unsteadiness": 4,
    "weakness_of_one_body_side": 4, "loss_of_smell": 3, "bladder_discomfort": 4, "foul_smell_of urine": 5,
    "continuous_feel_of_urine": 6, "passage_of_gases": 5, "internal_itching": 4, "toxic_look_(typhos)": 5,
    "depression": 3, "irritability": 2, "muscle_pain": 2, "altered_sensorium": 2, "red_spots_over_body": 3,
    "belly_pain": 4, "abnormal_menstruation": 6, "dischromic _patches": 6, "watering_from_eyes": 4,
    "increased_appetite": 5, "polyuria": 4, "family_history": 5, "mucoid_sputum": 4, "rusty_sputum": 4,
    "lack_of_concentration": 3, "visual_disturbances": 3, "receiving_blood_transfusion": 5,
    "receiving_unsterile_injections": 5, "coma": 7, "stomach_bleeding": 6, "distention_of_abdomen": 4,
    "history_of_alcohol_consumption": 5, "fluid_overload.1": 4, "blood_in_sputum": 5,
    "prominent_veins_on_calf": 6, "palpitations": 4, "painful_walking": 2, "pus_filled_pimples": 2,
    "blackheads": 2, "scurring": 2, "skin_peeling": 3, "silver_like_dusting": 2, "small_dents_in_nails": 2,
    "inflammatory_nails": 2, "blister": 4, "red_sore_around_nose": 4, "yellow_crust_ooze": 4
}

with open(os.path.join(DATA_DIR, "symptom_severity.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Symptom", "weight"])
    for sym in SYMPTOMS:
        writer.writerow([sym, SEVERITY_MAP.get(sym, 3)])

SPECIALIST_MAP = {
    "Fungal infection": {"specialist": "Dermatologist", "medicine_class": "Topical antifungal (e.g. Clotrimazole, Terbinafine)"},
    "Allergy": {"specialist": "Allergist / Immunologist", "medicine_class": "Antihistamine (e.g. Cetirizine, Fexofenadine)"},
    "GERD": {"specialist": "Gastroenterologist", "medicine_class": "Proton pump inhibitor (e.g. Omeprazole, Pantoprazole)"},
    "Chronic cholestasis": {"specialist": "Hepatologist / Gastroenterologist", "medicine_class": "Bile acid therapeutic (e.g. Ursodeoxycholic acid)"},
    "Drug Reaction": {"specialist": "Dermatologist / Clinical Pharmacologist", "medicine_class": "Corticosteroid & Antihistamine"},
    "Peptic ulcer diseae": {"specialist": "Gastroenterologist", "medicine_class": "H2 blocker / PPI & Mucosal protectant (e.g. Sucralfate)"},
    "AIDS": {"specialist": "Infectious Disease Specialist", "medicine_class": "Antiretroviral therapy (ART regimen)"},
    "Diabetes ": {"specialist": "Endocrinologist", "medicine_class": "Oral hypoglycemic / Insulin therapy (e.g. Metformin)"},
    "Gastroenteritis": {"specialist": "Gastroenterologist / General Physician", "medicine_class": "Electrolyte rehydration & Antimicrobial / Probiotic"},
    "Bronchial Asthma": {"specialist": "Pulmonologist", "medicine_class": "Inhaled bronchodilator & Corticosteroid (e.g. Salbutamol)"},
    "Hypertension ": {"specialist": "Cardiologist", "medicine_class": "Antihypertensive (e.g. ACE inhibitor, ARB, Beta-blocker)"},
    "Migraine": {"specialist": "Neurologist", "medicine_class": "Triptan & Prophylactic antimigraine (e.g. Sumatriptan)"},
    "Cervical spondylosis": {"specialist": "Orthopedic Specialist / Spine Surgeon", "medicine_class": "Muscle relaxant & NSAID analgesic"},
    "Paralysis (brain hemorrhage)": {"specialist": "Neurologist / Neurosurgeon", "medicine_class": "Neuroprotective & Osmotic diuretic / BP regulator"},
    "Jaundice": {"specialist": "Hepatologist / Gastroenterologist", "medicine_class": "Hepatoprotective agent & Supportive therapy"},
    "Malaria": {"specialist": "Infectious Disease Specialist", "medicine_class": "Artemisinin-based combination therapy (ACT)"},
    "Chicken pox": {"specialist": "Infectious Disease Specialist / Pediatrician", "medicine_class": "Antiviral (e.g. Acyclovir) & Calamine lotion"},
    "Dengue": {"specialist": "Infectious Disease Specialist / General Physician", "medicine_class": "Antipyretic (Paracetamol only) & Platelet support"},
    "Typhoid": {"specialist": "Infectious Disease Specialist / General Physician", "medicine_class": "Fluoroquinolone / Third-gen Cephalosporin"},
    "hepatitis A": {"specialist": "Hepatologist", "medicine_class": "Supportive rehydration & Hepatoprotective agent"},
    "Hepatitis B": {"specialist": "Hepatologist", "medicine_class": "Nucleoside reverse transcriptase inhibitor (e.g. Tenofovir)"},
    "Hepatitis C": {"specialist": "Hepatologist", "medicine_class": "Direct-acting antiviral (e.g. Sofosbuvir / Velpatasvir)"},
    "Hepatitis D": {"specialist": "Hepatologist", "medicine_class": "Pegylated interferon alpha"},
    "Hepatitis E": {"specialist": "Hepatologist", "medicine_class": "Supportive symptomatic therapy & Hydration"},
    "Alcoholic hepatitis": {"specialist": "Hepatologist / Addiction Medicine Specialist", "medicine_class": "Corticosteroid / Pentoxifylline & Nutritional support"},
    "Tuberculosis": {"specialist": "Pulmonologist / Infectious Disease Specialist", "medicine_class": "DOTS Quadruple regimen (Isoniazid, Rifampicin, Pyrazinamide, Ethambutol)"},
    "Common Cold": {"specialist": "General Physician / ENT Specialist", "medicine_class": "Decongestant & Antipyretic / Vitamin C"},
    "Pneumonia": {"specialist": "Pulmonologist", "medicine_class": "Broad-spectrum antibacterial (e.g. Amoxicillin-Clavulanate, Azithromycin)"},
    "Dimorphic hemmorhoids(piles)": {"specialist": "General Surgeon / Proctologist", "medicine_class": "Flavonoid venotonic & Topical anesthetic / Stool softener"},
    "Heart attack": {"specialist": "Interventional Cardiologist (Emergency)", "medicine_class": "Antiplatelet, Thrombolytic, Nitrate & Statin"},
    "Varicose veins": {"specialist": "Vascular Surgeon", "medicine_class": "Venoactive flavonoid (e.g. Micronized purified flavonoid fraction)"},
    "Hypothyroidism": {"specialist": "Endocrinologist", "medicine_class": "Synthetic thyroid hormone (Levothyroxine Sodium)"},
    "Hyperthyroidism": {"specialist": "Endocrinologist", "medicine_class": "Antithyroid agent (e.g. Methimazole, Carbimazole) & Beta-blocker"},
    "Hypoglycemia": {"specialist": "Endocrinologist", "medicine_class": "Fast-acting oral glucose / Glucagon injection"},
    "Osteoarthristis": {"specialist": "Orthopedic Specialist / Rheumatologist", "medicine_class": "Chondroprotective agent & Topical/Oral NSAID"},
    "Arthritis": {"specialist": "Rheumatologist", "medicine_class": "Disease-modifying antirheumatic drug (DMARD) & Anti-inflammatory"},
    "(vertigo) Paroymsal  Positional Vertigo": {"specialist": "ENT Specialist / Neurologist", "medicine_class": "Vestibular suppressant (e.g. Betahistine, Meclizine)"},
    "Acne": {"specialist": "Dermatologist", "medicine_class": "Topical retinoid & Benzoyl peroxide / Clindamycin"},
    "Urinary tract infection": {"specialist": "Urologist / Nephrologist", "medicine_class": "Urinary antimicrobial (e.g. Nitrofurantoin, Fosfomycin) & Alkalizer"},
    "Psoriasis": {"specialist": "Dermatologist", "medicine_class": "Topical corticosteroid, Calcipotriol & Biologic agent"},
    "Impetigo": {"specialist": "Dermatologist / Pediatrician", "medicine_class": "Topical antibiotic ointment (e.g. Mupirocin, Fusidic acid)"},
    "COVID-19": {"specialist": "Pulmonologist / Infectious Disease Specialist", "medicine_class": "Antiviral (e.g. Nirmatrelvir-Ritonavir / Paxlovid) & Supportive therapy"},
    "Appendicitis": {"specialist": "General Surgeon (Emergency)", "medicine_class": "Pre-operative IV Antibiotics & Surgical Appendectomy"},
    "Kidney Stones": {"specialist": "Urologist", "medicine_class": "Alpha-1 blocker (e.g. Tamsulosin) & NSAID Analgesic"},
    "Anemia": {"specialist": "Hematologist / General Physician", "medicine_class": "Elemental Iron & Folic Acid / Vitamin B12 Supplements"},
    "Influenza (Flu)": {"specialist": "General Physician", "medicine_class": "Neuraminidase inhibitor (e.g. Oseltamivir / Tamiflu) & Antipyretic"},
    "Gallstones": {"specialist": "Gastroenterologist / General Surgeon", "medicine_class": "Bile acid therapeutic (e.g. Ursodeoxycholic acid) / Laparoscopic Cholecystectomy"},
    "Sinusitis": {"specialist": "ENT Specialist", "medicine_class": "Nasal corticosteroid spray, Decongestant & Antibiotic"},
    "Tonsillitis": {"specialist": "ENT Specialist", "medicine_class": "Oral Penicillin/Amoxicillin & Analgesic Throat Spray"},
    "Acute Pancreatitis": {"specialist": "Gastroenterologist (Emergency)", "medicine_class": "IV Resuscitation, Analgesics & Pancreatic Enzymes"},
    "Eczema": {"specialist": "Dermatologist", "medicine_class": "Topical Emollient, Corticosteroid & Calcineurin Inhibitor"},
    "Sciatica": {"specialist": "Neurologist / Orthopedic Spine Specialist", "medicine_class": "Neuropathic analgesic (e.g. Pregabalin, Gabapentin) & NSAID"},
    "Gout": {"specialist": "Rheumatologist", "medicine_class": "Urate-lowering therapy (e.g. Allopurinol, Febuxostat) & Colchicine"},
    "Chronic Kidney Disease": {"specialist": "Nephrologist", "medicine_class": "ACE inhibitor / ARB, Erythropoietin & Phosphate binder"},
    "Non-Alcoholic Fatty Liver Disease": {"specialist": "Hepatologist / Endocrinologist", "medicine_class": "Hepatoprotective agent, Vitamin E & Insulin sensitizer"},
    "Parkinson's Disease": {"specialist": "Neurologist", "medicine_class": "Dopamine precursor (Levodopa/Carbidopa) & Dopamine agonist"},
    "Meningitis": {"specialist": "Neurologist / Infectious Disease Specialist (Emergency)", "medicine_class": "IV Broad-spectrum Cephalosporin (Ceftriaxone) & Dexamethasone"},
    "Shingles": {"specialist": "Dermatologist / Neurologist", "medicine_class": "Oral Antiviral (Valacyclovir / Acyclovir) & Neuropathic pain agent"},
    "Conjunctivitis": {"specialist": "Ophthalmologist", "medicine_class": "Ophthalmic Antibiotic / Antihistamine Drops & Lubricant"},
    "COPD": {"specialist": "Pulmonologist", "medicine_class": "Inhaled LAMA/LABA Bronchodilator & Corticosteroid"},
    "Fibromyalgia": {"specialist": "Rheumatologist / Pain Specialist", "medicine_class": "SNRI (e.g. Duloxetine) & Pregabalin"},
    "Otitis Media": {"specialist": "ENT Specialist", "medicine_class": "Oral Amoxicillin & Analgesic Ear Drops"},
    "Pulmonary Embolism": {"specialist": "Interventional Pulmonologist / Cardiologist (Emergency)", "medicine_class": "Anticoagulant (e.g. Heparin, Rivaroxaban) & Thrombolytic"},
    "Gastritis": {"specialist": "Gastroenterologist", "medicine_class": "Proton Pump Inhibitor (Omeprazole) & Antacid / H. pylori therapy"},
    "Systemic Lupus Erythematosus": {"specialist": "Rheumatologist", "medicine_class": "Hydroxychloroquine, Corticosteroid & Immunosuppressant"},
    "Rabies": {"specialist": "Infectious Disease Specialist (Emergency)", "medicine_class": "Rabies Vaccine (Post-Exposure) & Rabies Immunoglobulin"},
    "Tetanus": {"specialist": "Infectious Disease Specialist (Emergency)", "medicine_class": "Tetanus Immunoglobulin (TIG) & Metronidazole / Muscle relaxant"},
    "Sepsis": {"specialist": "Critical Care Specialist (Emergency)", "medicine_class": "IV Broad-spectrum Antibiotics, Vasopressors & Fluid Resuscitation"},
    "Endocarditis": {"specialist": "Cardiologist / Infectious Disease Specialist", "medicine_class": "High-dose IV Antibiotic Regimen (Vancomycin / Ceftriaxone)"},
    "Glaucoma": {"specialist": "Ophthalmologist", "medicine_class": "Ophthalmic Prostaglandin analogue / Beta-blocker eye drops"},
    "Cataract": {"specialist": "Ophthalmologist", "medicine_class": "Phacoemulsification Surgery & Intraocular Lens (IOL)"},
    "Deep Vein Thrombosis": {"specialist": "Vascular Surgeon / Hematologist", "medicine_class": "Anticoagulant therapy (Low-molecular-weight Heparin / DOAC)"},
    "Irritable Bowel Syndrome": {"specialist": "Gastroenterologist", "medicine_class": "Antispasmodic (Mebeverine) & Probiotic / Soluble Fiber"}
}

with open(os.path.join(DATA_DIR, "specialist_map.json"), "w", encoding="utf-8") as f:
    json.dump(SPECIALIST_MAP, f, indent=2)

IMAGE_REMEDIES = {
    "acne": {
        "title": "Acne Vulgaris",
        "category": "Dermatological Condition",
        "specialist": "Dermatologist",
        "severity": "Mild to Moderate",
        "remedies": [
            "Wash face twice daily with a gentle, non-foaming salicylic acid (1-2%) cleanser.",
            "Apply a thin layer of benzoyl peroxide (2.5-5%) gel to active pimples.",
            "Use oil-free, non-comedogenic sunscreen and moisturizers.",
            "Avoid popping or squeezing lesions to prevent permanent scarring and hyperpigmentation."
        ],
        "precautions": [
            "Do not over-scrub or use harsh physical exfoliants.",
            "Change pillowcases and clean phone screens frequently.",
            "Consult a dermatologist if cystic or unresponsive to OTC care."
        ]
    },
    "black_spots": {
        "title": "Black Spots & Hyperpigmentation",
        "category": "Cosmetic Skin Concern",
        "specialist": "Dermatologist / Aesthetician",
        "severity": "Cosmetic",
        "remedies": [
            "Apply a broad-spectrum SPF 50+ mineral sunscreen every morning without fail.",
            "Use topical serums containing Niacinamide (5-10%), Alpha Arbutin (2%), or Vitamin C.",
            "Incorporate gentle AHA chemical exfoliants (Lactic Acid or Glycolic Acid) 1-2 times weekly.",
            "Keep skin adequately hydrated with ceramide and hyaluronic acid based moisturizers."
        ],
        "precautions": [
            "Avoid direct sun exposure during peak UV hours (10 AM - 4 PM).",
            "Do not use high-percentage chemical peels without clinical supervision."
        ]
    },
    "puffy_eyes": {
        "title": "Periorbital Puffiness & Under-Eye Swelling",
        "category": "Cosmetic Skin Concern",
        "specialist": "General Physician / Dermatologist",
        "severity": "Cosmetic",
        "remedies": [
            "Apply a chilled eye mask, cold jade roller, or refrigerated green tea bags for 10-15 minutes.",
            "Use eye creams formulated with Caffeine (5%) and Peptides to promote lymphatic drainage.",
            "Sleep with your head slightly elevated to prevent fluid accumulation around the eyes.",
            "Ensure 7-9 hours of restful sleep and drink at least 2.5 liters of water daily."
        ],
        "precautions": [
            "Reduce dietary sodium intake, particularly during evening meals.",
            "Check for seasonal allergies or contact dermatitis if accompanied by redness or itching."
        ]
    },
    "wrinkles": {
        "title": "Fine Lines & Wrinkles",
        "category": "Cosmetic Skin Concern",
        "specialist": "Dermatologist / Aesthetic Physician",
        "severity": "Cosmetic",
        "remedies": [
            "Introduce a topical Retinoid or Retinol (0.2-0.5%) into your nighttime skincare routine.",
            "Apply broad-spectrum daily SPF 50+ sunscreen to prevent photoaging and collagen breakdown.",
            "Use antioxidant serums containing Vitamin C (10-15%), Vitamin E, and Ferulic acid.",
            "Keep skin deeply nourished with multi-molecular weight hyaluronic acid and peptide complex."
        ],
        "precautions": [
            "Always patch test retinol products and start with 2 nights per week.",
            "Avoid smoking and excessive UV exposure which accelerate skin elastin degradation."
        ]
    }
}

with open(os.path.join(DATA_DIR, "image_remedies.json"), "w", encoding="utf-8") as f:
    json.dump(IMAGE_REMEDIES, f, indent=2)

TN_DATA = {
    "districts": [
        "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
        "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
        "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris",
        "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga",
        "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
        "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore",
        "Viluppuram", "Virudhunagar"
    ],
    "hospitals": [
        {
            "id": "hosp-1",
            "name": "Apollo Hospitals Greams Road",
            "district": "Chennai",
            "taluk": "Thousand Lights",
            "address": "21 Greams Lane, Thousand Lights, Chennai, Tamil Nadu 600006",
            "rating": 4.8,
            "reviews_count": 8420,
            "phone": "+91 44 2829 0200",
            "website": "https://www.apollohospitals.com",
            "open_now": True,
            "hours": {
                "Monday": "24 Hours (Emergency & OPD 08:00 - 20:00)",
                "Tuesday": "24 Hours (Emergency & OPD 08:00 - 20:00)",
                "Wednesday": "24 Hours (Emergency & OPD 08:00 - 20:00)",
                "Thursday": "24 Hours (Emergency & OPD 08:00 - 20:00)",
                "Friday": "24 Hours (Emergency & OPD 08:00 - 20:00)",
                "Saturday": "24 Hours (Emergency & OPD 08:00 - 18:00)",
                "Sunday": "24 Hours Emergency Service"
            },
            "holiday_note": None,
            "specialties": ["Dermatology", "Cardiology", "Neurology", "Gastroenterology", "Pulmonology", "Orthopedics", "Emergency Care"],
            "branches": [
                {"district": "Madurai", "name": "Apollo Speciality Hospitals, Lake View Road, Madurai", "rating": 4.7, "reviews_count": 3120, "phone": "+91 452 258 0880", "address": "Lake View Road, K.K. Nagar, Madurai 625020", "open_now": True},
                {"district": "Tiruchirappalli", "name": "Apollo Speciality Hospitals, Ariyamangalam, Trichy", "rating": 4.6, "reviews_count": 1840, "phone": "+91 431 407 7777", "address": "Trichy-Chennai Trunk Road, Trichy 620010", "open_now": True},
                {"district": "Karur", "name": "Apollo Reach Hospital, Karur", "rating": 4.5, "reviews_count": 940, "phone": "+91 4324 233 333", "address": "Covai Road, Karur 639002", "open_now": True}
            ]
        },
        {
            "id": "hosp-2",
            "name": "KMCH (Kovai Medical Center and Hospital)",
            "district": "Coimbatore",
            "taluk": "Coimbatore North",
            "address": "99, Avinashi Rd, Peelamedu, Indira Nagar, Coimbatore, Tamil Nadu 641014",
            "rating": 4.7,
            "reviews_count": 6250,
            "phone": "+91 422 432 3800",
            "website": "https://www.kmchhospitals.com",
            "open_now": True,
            "hours": {
                "Monday": "24 Hours",
                "Tuesday": "24 Hours",
                "Wednesday": "24 Hours",
                "Thursday": "24 Hours",
                "Friday": "24 Hours",
                "Saturday": "24 Hours",
                "Sunday": "24 Hours Emergency"
            },
            "holiday_note": None,
            "specialties": ["Dermatology", "Cardiology", "Neurology", "Gastroenterology", "Pulmonology", "Endocrinology"],
            "branches": [
                {"district": "Erode", "name": "KMCH Speciality Hospital, Erode", "rating": 4.6, "reviews_count": 1450, "phone": "+91 424 226 2838", "address": "Perundurai Road, Erode 638011", "open_now": True},
                {"district": "Tiruppur", "name": "KMCH City Center, Tiruppur", "rating": 4.5, "reviews_count": 780, "phone": "+91 421 432 4000", "address": "Kangayam Road, Tiruppur 641604", "open_now": True}
            ]
        },
        {
            "id": "hosp-3",
            "name": "Christian Medical College (CMC)",
            "district": "Vellore",
            "taluk": "Vellore",
            "address": "Ida Scudder Road, Vellore, Tamil Nadu 632004",
            "rating": 4.9,
            "reviews_count": 14200,
            "phone": "+91 416 228 1000",
            "website": "https://www.cmch-vellore.edu",
            "open_now": True,
            "hours": {
                "Monday": "24 Hours (OPD 07:30 - 17:00)",
                "Tuesday": "24 Hours (OPD 07:30 - 17:00)",
                "Wednesday": "24 Hours (OPD 07:30 - 17:00)",
                "Thursday": "24 Hours (OPD 07:30 - 17:00)",
                "Friday": "24 Hours (OPD 07:30 - 17:00)",
                "Saturday": "24 Hours (OPD 07:30 - 12:30)",
                "Sunday": "24 Hours Emergency Care"
            },
            "holiday_note": "Special festive timings may apply on public holidays for non-emergency OPD.",
            "specialties": ["Dermatology", "Infectious Disease", "Cardiology", "Neurology", "Rheumatology", "Hepatology", "Endocrinology"],
            "branches": [
                {"district": "Ranipet", "name": "CMC Ranipet Campus Hospital", "rating": 4.8, "reviews_count": 3200, "phone": "+91 4172 281 000", "address": "Kilminnal, Ranipet 632517", "open_now": True},
                {"district": "Tirupathur", "name": "CMC Community Health Centre", "rating": 4.6, "reviews_count": 650, "phone": "+91 4179 220 120", "address": "Main Road, Tirupathur 635601", "open_now": True}
            ]
        },
        {
            "id": "hosp-4",
            "name": "Meenakshi Mission Hospital and Research Centre",
            "district": "Madurai",
            "taluk": "Madurai North",
            "address": "Melur Road, Madurai, Tamil Nadu 625107",
            "rating": 4.7,
            "reviews_count": 5890,
            "phone": "+91 452 426 3000",
            "website": "https://www.meenakshimission.org",
            "open_now": True,
            "hours": {
                "Monday": "24 Hours", "Tuesday": "24 Hours", "Wednesday": "24 Hours",
                "Thursday": "24 Hours", "Friday": "24 Hours", "Saturday": "24 Hours", "Sunday": "24 Hours"
            },
            "holiday_note": None,
            "specialties": ["Dermatology", "Cardiology", "Gastroenterology", "Pulmonology", "Orthopedics", "Infectious Disease"],
            "branches": [
                {"district": "Dindigul", "name": "Meenakshi Hospital Clinic, Dindigul", "rating": 4.5, "reviews_count": 420, "phone": "+91 451 242 1100", "address": "Palani Road, Dindigul 624001", "open_now": True},
                {"district": "Sivaganga", "name": "Meenakshi Outreach Centre, Karaikudi", "rating": 4.4, "reviews_count": 310, "phone": "+91 4565 224 800", "address": "College Road, Karaikudi 630002", "open_now": True}
            ]
        },
        {
            "id": "hosp-5",
            "name": "Kauvery Hospital",
            "district": "Tiruchirappalli",
            "taluk": "Tiruchirappalli West",
            "address": "1, K.C. Road, Tennur, Tiruchirappalli, Tamil Nadu 620017",
            "rating": 4.8,
            "reviews_count": 4980,
            "phone": "+91 431 400 6000",
            "website": "https://www.kauveryhospital.com",
            "open_now": True,
            "hours": {
                "Monday": "24 Hours", "Tuesday": "24 Hours", "Wednesday": "24 Hours",
                "Thursday": "24 Hours", "Friday": "24 Hours", "Saturday": "24 Hours", "Sunday": "24 Hours"
            },
            "holiday_note": None,
            "specialties": ["Gastroenterology", "Cardiology", "Neurology", "Orthopedics", "Pulmonology", "Dermatology"],
            "branches": [
                {"district": "Chennai", "name": "Kauvery Hospital Alwarpet, Chennai", "rating": 4.7, "reviews_count": 5200, "phone": "+91 44 4000 6000", "address": "199 Luz Church Road, Alwarpet, Chennai 600004", "open_now": True},
                {"district": "Salem", "name": "Kauvery Hospital, Salem", "rating": 4.6, "reviews_count": 2100, "phone": "+91 427 400 6000", "address": "Meyyanur Main Road, Salem 636004", "open_now": True},
                {"district": "Thanjavur", "name": "Kauvery Medical Centre, Thanjavur", "rating": 4.5, "reviews_count": 920, "phone": "+91 4362 230 000", "address": "Medical College Road, Thanjavur 613007", "open_now": True}
            ]
        }
    ]
}

with open(os.path.join(DATA_DIR, "tn_districts.json"), "w", encoding="utf-8") as f:
    json.dump(TN_DATA, f, indent=2)

print("Generated all files successfully.")
