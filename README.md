# Disease Prediction Using Machine Learning

Predicts a likely condition from a set of reported symptoms, using a model trained on the
standard 132-symptom / 41-disease dataset. FastAPI backend + React (Vite/Tailwind) frontend,
styled as a clinical "diagnostic console."

> ⚠️ This is a statistical pattern-matching tool for a course/portfolio project. It is **not**
> a diagnostic device and must never be used as a substitute for professional medical advice.
> The disclaimer is surfaced in the API response and in the UI on every prediction.

## How it works

### Symptom-based prediction
- **Model**: Random Forest classifier (132 binary symptom features → 41 disease classes).
  Decision Tree, Naive Bayes, and SVM were trained and compared in `backend/train.py` — all
  four hit 100% test accuracy since the dataset is cleanly separable, so Random Forest was
  picked as the deployed model because it's an ensemble and generalizes better to noisy or
  partial real-world symptom input than a single Decision Tree.
- **Enrichment**: predictions are enriched with a plain-language description, suggested
  precautions, and a severity score (from a second reference dataset).
- **API**: `GET /api/symptoms` lists all 132 recognized symptoms with severity weights.
  `POST /api/predict` takes a list of symptom keys and returns the top prediction, a
  5-item differential (next closest matches), matched/unmatched symptoms, and the disclaimer.

### Image-based prediction (skin photos)
- **Model**: a small CNN (~258K params, 4 conv blocks) trained **from scratch** in
  `backend/train_image_model.py` on ~1,280 photos across 4 classes: acne, black spots
  (hyperpigmentation), puffy eyes, wrinkles.
- **Honest accuracy**: **59.5% held-out test accuracy** (vs. 25% chance level for 4 classes).
  This is a real, modest number — not the "100% accuracy" sometimes hoped for. No genuine
  image classifier hits 100% on real-world photos; skin conditions have a lot of visual
  overlap, and this model was trained without ImageNet-pretrained weights (this build
  environment can't reach the domains that host them) on a fairly small dataset. See
  "Improving image accuracy" below for how to do meaningfully better.
- **API**: `POST /api/predict-image` (multipart file upload) returns the top match, all class
  probabilities, remedies, and a disclaimer. `GET /api/image-model-info` reports whether the
  image model is loaded and its test accuracy.
- **Note on dataset scope**: the free dataset used here (sourced from GitHub, since Kaggle
  isn't reachable from the build environment) covers 4 common skin *concerns*, only one of
  which (acne) is a clinical "disease" in the same sense as the symptom checker's 41 classes.
  Black spots, puffy eyes, and wrinkles are cosmetic skin conditions, so their "remedies" are
  general skincare guidance, not medical treatment.

### Doctor / hospital finder (Tamil Nadu-focused, works anywhere)
- Every prediction (symptom-based or image-based) now includes a **recommended specialist
  type** (e.g. "Dermatologist", "Gastroenterologist") and a **medicine class** (e.g. "Topical
  antifungal") — general, non-prescriptive mapping, not specific drugs or dosages.
- A **"Find [specialist] near you"** panel appears under every prediction, with two modes:
  - **Use my location** — browser GPS, searched via Google Places within a ~20km radius.
  - **District / Taluk** — a dropdown of Tamil Nadu's 38 verified districts, plus a free-text
    taluk field (Google Places resolves the taluk name itself — a hardcoded taluk list would
    risk being incomplete or stale, so this is intentionally live-queried rather than static).
- Results are **live from the Google Places API** — real hospital names, addresses, ratings,
  review counts, phone numbers, and a "Open in Maps" link. This deliberately does **not**
  include individual doctor names or a static hospital ranking: I don't have a verified,
  current directory of doctors/hospitals across every Tamil Nadu district and taluk, and
  fabricating one would risk sending someone to a wrong or nonexistent provider. Live Places
  data is the accurate alternative.
- **Setup**: get a Google Places API key (Google Cloud Console → enable "Places API (New)" →
  create an API key) and set `GOOGLE_PLACES_API_KEY` as an environment variable (see
  `backend/.env.example`). Without a key, the app still runs fine — the hospital-finder panel
  just shows a clear "not configured" message instead of results.
  Note: opening-hours fields (`regularOpeningHours`, `currentOpeningHours`) sit in Google's
  paid "Enterprise" SKU tier, which has a smaller free monthly allowance than basic fields —
  see "Getting an API key" below.

### Opening hours, holiday hours, and branch lookup
- Each hospital card shows a live **open now / closed now** badge and an expandable full
  weekly schedule, pulled from Google's `regularOpeningHours` field.
- If Google's `currentOpeningHours` (which reflects the next 7 days including holiday/special
  closures) differs from the regular weekly schedule, the card flags **"Hours differ from
  usual this week — possibly a holiday."**
- Every hospital card has a **"Check branches in other districts"** control — pick any of the
  38 Tamil Nadu districts and it independently looks up whether that hospital/chain has a
  branch there, with that branch's own live rating, address, and hours (nothing is copied
  from the original branch, since a different branch can have completely different hours).
- **Results are sorted best-reviewed first.** Higher Google rating wins; ties are broken by
  total review count (a 4.8★ from 500 reviews outranks a 4.8★ from 3). The top result is
  marked "Top rated." Ratings are always current — Google's rating is a live aggregate, so
  every search already reflects this month's reviews without needing separate tracking.

### What this app intentionally does NOT do
- **No individual doctor schedules.** No public API exposes real per-doctor availability
  across arbitrary hospitals — inventing time slots risks sending a patient to an appointment
  that doesn't exist.
- **No in-app appointment booking.** Actually reserving a slot needs integration with each
  hospital's own booking system (or a service like Practo) individually. Instead, the app
  surfaces the hospital's phone number ("Call to book") and website link so the person can
  book through a channel that's actually real.

## Getting an API key

Google retired the old universal $200/month credit in March 2025. The current model is
per-feature free monthly thresholds that reset every month (not a one-time trial), plus a
general new-customer **Google Cloud $300 credit valid for 90 days** that covers any GCP usage,
including Places API. To get set up:

1. Create a Google Cloud account at [cloud.google.com](https://cloud.google.com) — new accounts
   get the $300 / 90-day trial credit.
2. In Cloud Console: **APIs & Services → Library** → search "Places API (New)" → **Enable**.
   A payment method is required to activate billing even during the trial; Google won't charge
   until the credit runs out or 90 days pass.
3. **APIs & Services → Credentials → Create Credentials → API Key.** Immediately restrict it
   to "Places API (New)" only, plus an IP or HTTP-referrer restriction.
4. Set a budget alert (**Billing → Budgets & alerts**) — the opening-hours fields this app
   requests are in the Enterprise SKU tier, which has a smaller free allowance than basic
   fields like name/address/rating.
5. Put the key in `backend/.env` (copy from `.env.example`) for local dev, or as a
   `GOOGLE_PLACES_API_KEY` environment variable in `docker-compose.yml` for deployment.

## Project structure

```
disease-prediction/
├── backend/
│   ├── main.py                # FastAPI app (symptom + image + hospital-finder endpoints)
│   ├── train.py                # Trains + compares symptom models, saves the best one
│   ├── train_image_model.py    # Trains the skin-image CNN from scratch
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example            # GOOGLE_PLACES_API_KEY goes here
│   ├── data/                   # Training.csv, Testing.csv, description/precaution/severity CSVs,
│   │                            # image_remedies.json, specialist_map.json, tn_districts.json
│   ├── image_data/             # train/ and test/ folders of skin photos, by class
│   └── model/                  # Generated: model.joblib, skin_image_model.keras, etc.
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Mode toggle: Symptoms / Image
│   │   ├── api.js
│   │   └── components/
│   │       ├── SymptomSelector.jsx
│   │       ├── ResultsPanel.jsx
│   │       ├── ImageUploader.jsx
│   │       ├── ImageResultsPanel.jsx
│   │       ├── HospitalFinder.jsx      # search + hours + branch lookup
│   │       └── RadialGauge.jsx
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

## Run locally (without Docker)

**Backend**
```bash
cd backend
pip install -r requirements.txt
python train.py                 # trains the symptom model, writes backend/model/*
python train_image_model.py     # trains the skin-image CNN (~10-15 min on CPU)
uvicorn main:app --reload --port 8000
```
API docs at `http://localhost:8000/docs`. The server starts fine even if you skip
`train_image_model.py` — the image endpoints just report `"available": false` until you run it.

**Frontend**
```bash
cd frontend
npm install
npm run dev               # dev server, usually http://localhost:5173
```
Set `VITE_API_BASE` in a `.env` file if the backend isn't on `http://localhost:8000`.

## Run with Docker

```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000` (docs at `/docs`)

The backend image trains the **symptom** model at build time. The **image** model is not
trained automatically during the build (it needs `image_data/` and several minutes of CPU
time) — after `docker compose up`, run it once inside the container:
```bash
docker exec -it disease-prediction-backend python train_image_model.py
docker restart disease-prediction-backend
```

## Retraining / swapping the symptom dataset

`backend/train.py` expects `data/Training.csv` and `data/Testing.csv` in the standard format
(132 binary symptom columns + a `prognosis` column). Swap in your own dataset in the same
shape and re-run `python train.py` — it will re-fit all four models, print a comparison table,
and save whichever wins on held-out test accuracy (Random Forest on ties).

## Improving image accuracy

The 59.5% test accuracy here reflects a small CNN trained from scratch on ~1,280 images and
4 classes, in a sandbox that can't reach the domains that host pretrained ImageNet weights.
On your own machine (with internet access and ideally a GPU), you can do meaningfully better:

1. **Use transfer learning.** Swap the custom CNN in `train_image_model.py` for
   `tf.keras.applications.MobileNetV2` or `EfficientNetB0` with `weights="imagenet"`, freeze
   the base, and fine-tune. This alone typically adds 15-30 points of accuracy on small
   datasets like this one.
2. **Get more data, more classes.** Kaggle has larger dermatology datasets (DermNet's 23
   classes, HAM10000's 10,015 dermoscopic images, ISIC's archive). Download via the Kaggle
   API (`kaggle datasets download ...`) and point `train_image_model.py` at the new
   `image_data/train` and `image_data/test` folders — the training script doesn't need to
   change, just the folder structure (one subfolder per class).
3. **Address class imbalance** with class weights or oversampling if the new dataset isn't
   balanced.
4. **Report a confidence threshold** in the UI below which you show "not confident enough —
   consult a dermatologist" rather than forcing a top-1 answer.

## Next steps / ideas

- Weight symptoms by the severity score instead of treating them as flat binary features.
- Add a confidence threshold below which the UI recommends "insufficient symptoms — consult
  a doctor" instead of a specific disease.
- Combine both modes: use image prediction to suggest likely symptoms to check off.
