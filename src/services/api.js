import axios from 'axios';
import { authStore } from '../store/auth';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // URL backend Anda
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  const token = authStore.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle rate limiting and other errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Handle rate limiting errors
      if (error.response.status === 429) {
        const message = error.response.data?.error || 'Too many requests. Please try again later.';
        console.warn('Rate limit exceeded:', message);
        // You can show a toast or notification here
        throw new Error(message);
      }
      
      // Handle authentication errors
      if (error.response.status === 401) {
        console.warn('Authentication failed, clearing auth');
        authStore.clearAuth();
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// User API endpoints
export const userAPI = {
  // Get all users (admin only)
  getAllUsers: () => apiClient.get('/users'),
  
  // Get user by ID
  getUserById: (id) => apiClient.get(`/users/${id}`),
  
  // Create new user
  createUser: (userData) => apiClient.post('/users', userData),
  
  // Update user
  updateUser: (id, userData) => apiClient.put(`/users/${id}`, userData),
  
  // Delete user
  deleteUser: (id) => apiClient.delete(`/users/${id}`)
};

// Student API endpoints
export const studentAPI = {
  getAllStudents: () => apiClient.get('/students'),
  getStudentById: (id) => apiClient.get(`/students/${id}`),
  createStudent: (studentData) => apiClient.post('/students', studentData),
  updateStudent: (id, studentData) => apiClient.put(`/students/${id}`, studentData),
  deleteStudent: (id) => apiClient.delete(`/students/${id}`)
};

// Lecturer API endpoints
export const lecturerAPI = {
  getAllLecturers: () => apiClient.get('/lecturers'),
  getLecturerById: (id) => apiClient.get(`/lecturers/${id}`),
  createLecturer: (lecturerData) => apiClient.post('/lecturers', lecturerData),
  updateLecturer: (id, lecturerData) => apiClient.put(`/lecturers/${id}`, lecturerData),
  deleteLecturer: (id) => apiClient.delete(`/lecturers/${id}`)
};

// Auth API endpoints
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh')
};

export default apiClient;