import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5134/api'
});

// Attach JWT from sessionStorage
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('authToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle expired or invalid JWT
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('tradeMateUser');

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;