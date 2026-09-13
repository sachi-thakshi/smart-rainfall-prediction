import axios from 'axios';

// Detect whether to use proxy (/api) or direct backend URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Response interceptor for clear error messaging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let customMessage = 'Network error: could not connect to backend server.';
    if (error.response) {
      customMessage = error.response.data?.detail || error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      customMessage = 'Backend server is not running on http://127.0.0.1:8000. Please start the FastAPI backend.';
    }
    return Promise.reject(new Error(customMessage));
  }
);
