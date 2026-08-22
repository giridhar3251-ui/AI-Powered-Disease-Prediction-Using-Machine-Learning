const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchSymptoms() {
  const res = await fetch(`${API_BASE}/api/symptoms`);
  if (!res.ok) throw new Error('Failed to fetch symptom vocabulary');
  return res.json();
}

export async function predictDisease(symptoms, topK = 5) {
  const res = await fetch(`${API_BASE}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms, top_k: topK })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Prediction failed' }));
    throw new Error(err.detail || 'Prediction request failed');
  }
  return res.json();
}

export async function fetchImageModelInfo() {
  const res = await fetch(`${API_BASE}/api/image-model-info`);
  if (!res.ok) throw new Error('Failed to fetch image model details');
  return res.json();
}

export async function predictSkinImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/predict-image`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Image analysis failed' }));
    throw new Error(err.detail || 'Image analysis request failed');
  }
  return res.json();
}

export async function fetchDistricts() {
  const res = await fetch(`${API_BASE}/api/districts`);
  if (!res.ok) throw new Error('Failed to fetch districts');
  return res.json();
}

export async function searchHospitals({ district, taluk, specialty, lat, lng }) {
  const params = new URLSearchParams();
  if (district) params.append('district', district);
  if (taluk) params.append('taluk', taluk);
  if (specialty) params.append('specialty', specialty);
  if (lat) params.append('lat', lat);
  if (lng) params.append('lng', lng);

  const res = await fetch(`${API_BASE}/api/hospitals?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to search hospitals');
  return res.json();
}

export async function lookupBranch(hospitalId, targetDistrict) {
  const res = await fetch(`${API_BASE}/api/hospitals/${hospitalId}/branch-lookup?target_district=${encodeURIComponent(targetDistrict)}`);
  if (!res.ok) throw new Error('Failed to lookup branch');
  return res.json();
}

export async function loginUser(email, password, role = 'Clinician') {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

export async function registerUser(name, email, password, role = 'Patient', institution = '') {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role, institution })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}

