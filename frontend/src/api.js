const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? '' : 'http://localhost:8000');

async function safeJson(res) {
  const text = await res.text();
  if (!text || text.trim() === '') {
    throw new Error(`Server returned an empty response (Status ${res.status}). Ensure backend is connected.`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("API response is not valid JSON. Status:", res.status, "Body:", text);
    throw new Error(`Server returned invalid data (Status ${res.status}). Ensure VITE_API_BASE is set correctly.`);
  }
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error('Health check failed');
  return safeJson(res);
}

export async function fetchSymptoms() {
  const res = await fetch(`${API_BASE}/api/symptoms`);
  if (!res.ok) throw new Error('Failed to fetch symptom vocabulary');
  return safeJson(res);
}

export async function predictDisease(symptoms, topK = 5) {
  const res = await fetch(`${API_BASE}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms, top_k: topK })
  });
  if (!res.ok) {
    try {
      const err = await safeJson(res);
      throw new Error(err.detail || 'Prediction request failed');
    } catch(e) {
      throw new Error('Prediction request failed: Server error');
    }
  }
  return safeJson(res);
}

export async function fetchImageModelInfo() {
  const res = await fetch(`${API_BASE}/api/image-model-info`);
  if (!res.ok) throw new Error('Failed to fetch image model details');
  return safeJson(res);
}

export async function predictSkinImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/predict-image`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    try {
      const err = await safeJson(res);
      throw new Error(err.detail || 'Image analysis request failed');
    } catch(e) {
      throw new Error('Image analysis request failed: Server error');
    }
  }
  return safeJson(res);
}

export async function fetchDistricts() {
  const res = await fetch(`${API_BASE}/api/districts`);
  if (!res.ok) throw new Error('Failed to fetch districts');
  return safeJson(res);
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
  return safeJson(res);
}

export async function lookupBranch(hospitalId, targetDistrict) {
  const res = await fetch(`${API_BASE}/api/hospitals/${hospitalId}/branch-lookup?target_district=${encodeURIComponent(targetDistrict)}`);
  if (!res.ok) throw new Error('Failed to lookup branch');
  return safeJson(res);
}

export async function loginUser(email, password, role = 'Clinician') {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });
  if (!res.ok) {
    try {
      const err = await safeJson(res);
      throw new Error(err.detail || 'Login failed');
    } catch(e) {
      throw new Error('Login failed: Server error');
    }
  }
  return safeJson(res);
}

export async function registerUser(name, email, password, role = 'Patient', institution = '') {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role, institution })
  });
  if (!res.ok) {
    try {
      const err = await safeJson(res);
      throw new Error(err.detail || 'Registration failed');
    } catch(e) {
      throw new Error('Registration failed: Server error');
    }
  }
  return safeJson(res);
}
