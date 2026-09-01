/**
 * API Client for Disease Prediction Backend
 * Handles all HTTP requests to the FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Make a fetch request with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

  // ==================== HEALTH & STATUS ====================
  
  async getHealthStatus() {
    return this.request('/api/health');
  }

  // ==================== SYMPTOMS ====================
  
  async getSymptoms() {
    return this.request('/api/symptoms');
  }

  async predictDisease(symptoms, topK = 5) {
    return this.request('/api/predict', {
      method: 'POST',
      body: JSON.stringify({
        symptoms,
        top_k: topK,
      }),
    });
  }

  // ==================== IMAGE ANALYSIS ====================
  
  async getImageModelInfo() {
    return this.request('/api/image-model-info');
  }

  async predictSkinImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${this.baseURL}/api/predict-image`, {
      method: 'POST',
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `HTTP ${response.status}`);
      }
      return response.json();
    });
  }

  // ==================== HOSPITALS ====================
  
  async getDistricts() {
    return this.request('/api/districts');
  }

  async searchHospitals(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.district) queryParams.append('district', params.district);
    if (params.taluk) queryParams.append('taluk', params.taluk);
    if (params.specialty) queryParams.append('specialty', params.specialty);
    if (params.lat) queryParams.append('lat', params.lat);
    if (params.lng) queryParams.append('lng', params.lng);
    if (params.radius_km) queryParams.append('radius_km', params.radius_km);

    const query = queryParams.toString();
    const endpoint = `/api/hospitals${query ? '?' + query : ''}`;
    return this.request(endpoint);
  }

  async lookupHospitalBranch(hospitalId, targetDistrict) {
    return this.request(
      `/api/hospitals/${hospitalId}/branch-lookup?target_district=${encodeURIComponent(targetDistrict)}`
    );
  }

  // ==================== AUTHENTICATION ====================
  
  async login(email, password, role = 'Clinician') {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        role,
      }),
    });
  }

  async register(name, email, password, role = 'Patient', institution = null) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        institution: institution || 'AegisMed Network',
      }),
    });
  }
}

export default new APIClient();
