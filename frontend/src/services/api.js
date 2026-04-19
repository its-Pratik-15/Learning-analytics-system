import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
      throw error.response.data;
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
      throw new Error('Network error. Please check if the backend server is running.');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      throw new Error(error.message);
    }
  }
);

// Student Risk Prediction - Matches backend /api/predict endpoint
export const predictStudentRisk = async (studentData) => {
  const response = await api.post('/api/predict', studentData);
  return response.data;
};

// Health Check - Matches backend /api/health endpoint
export const healthCheck = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

export default api;
