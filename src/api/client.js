/**
 * API client for communicating with the FastAPI backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    return localStorage.getItem('wanderai_token');
  }

  setToken(token) {
    localStorage.setItem('wanderai_token', token);
  }

  clearToken() {
    localStorage.removeItem('wanderai_token');
  }

  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
      }
      let errorMsg = 'An error occurred. Please try again.';
      if (typeof data?.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data?.detail) && data.detail.length > 0) {
        errorMsg = data.detail.map((d) => d.msg || 'Invalid input').join('; ');
      }
      const error = new Error(errorMsg);
      error.status = response.status;
      throw error;
    }

    return data;
  }

  // Auth
  async register(email, username, password, fullName) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password, full_name: fullName }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  // Trips
  async listTrips(status) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/api/trips/${params}`);
  }

  async getTrip(tripId) {
    return this.request(`/api/trips/${tripId}`);
  }

  async generateTrip(tripData) {
    return this.request('/api/trips/generate', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  async updateTrip(tripId, updates) {
    return this.request(`/api/trips/${tripId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTrip(tripId) {
    return this.request(`/api/trips/${tripId}`, {
      method: 'DELETE',
    });
  }

  async regenerateTrip(tripId) {
    return this.request(`/api/trips/${tripId}/regenerate`, {
      method: 'POST',
    });
  }

  async regenerateDay(tripId, dayNumber, feedback = '') {
    return this.request(`/api/trips/${tripId}/days/${dayNumber}/regenerate`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  }

  // Health
  async healthCheck() {
    return this.request('/api/health');
  }
}

export const api = new ApiClient();
export default api;
