import axios from 'axios';
import { authStore } from '../store/auth';

// Use environment variable for API base URL, fallback to localhost for development
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
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

// Course API endpoints
export const courseAPI = {
  getAllCourses: () => apiClient.get('/courses'),
  getCourseById: (id) => apiClient.get(`/courses/${id}`),
  /** Create course with optional file upload */
  createCourse: (courseData, files = null) => {
    const formData = new FormData();
    // Add course fields
    Object.keys(courseData).forEach(key => {
      if (courseData[key] !== null && courseData[key] !== undefined) {
        formData.append(key, courseData[key]);
      }
    });
    // Add files if provided
    if (files) {
      if (Array.isArray(files)) {
        files.forEach(file => formData.append('files', file));
      } else {
        formData.append('files', files);
      }
    }
    return apiClient.post('/courses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  /** Update course with optional file upload */
  updateCourse: (id, courseData, files = null) => {
    const formData = new FormData();
    // Add course fields
    Object.keys(courseData).forEach(key => {
      if (courseData[key] !== null && courseData[key] !== undefined) {
        formData.append(key, courseData[key]);
      }
    });
    // Add files if provided
    if (files) {
      if (Array.isArray(files)) {
        files.forEach(file => formData.append('files', file));
      } else {
        formData.append('files', files);
      }
    }
    return apiClient.put(`/courses/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteCourse: (id) => apiClient.delete(`/courses/${id}`)
};

// Class API endpoints
export const classAPI = {
  getAllClasses: () => apiClient.get('/classes'),
  getClassById: (id) => apiClient.get(`/classes/${id}`),
  createClass: (classData) => apiClient.post('/classes', classData),
  updateClass: (id, classData) => apiClient.put(`/classes/${id}`, classData),
  deleteClass: (id) => apiClient.delete(`/classes/${id}`)
};

// Program API endpoints
export const programAPI = {
  getAllPrograms: () => apiClient.get('/programs'),
  getProgramById: (id) => apiClient.get(`/programs/${id}`),
  createProgram: (programData) => apiClient.post('/programs', programData),
  updateProgram: (id, programData) => apiClient.put(`/programs/${id}`, programData),
  deleteProgram: (id) => apiClient.delete(`/programs/${id}`)
};

// Price API endpoints
export const priceAPI = {
  getAllPrices: () => apiClient.get('/prices'),
  getPriceById: (id) => apiClient.get(`/prices/${id}`),
  createPrice: (priceData) => apiClient.post('/prices', priceData),
  updatePrice: (id, priceData) => apiClient.put(`/prices/${id}`, priceData),
  deletePrice: (id) => apiClient.delete(`/prices/${id}`)
};

/** Ancillary Price API - additional fees (exam, registration, etc.) */
export const ancillaryPriceAPI = {
  getAll: () => apiClient.get('/ancillary_price'),
  getById: (id) => apiClient.get(`/ancillary_price/${id}`),
  create: (data) => apiClient.post('/ancillary_price', data),
  update: (id, data) => apiClient.put(`/ancillary_price/${id}`, data),
  delete: (id) => apiClient.delete(`/ancillary_price/${id}`)
};

// Level API endpoints
export const levelAPI = {
  getAllLevels: () => apiClient.get('/levels'),
  getLevelById: (id) => apiClient.get(`/levels/${id}`),
  createLevel: (levelData) => apiClient.post('/levels', levelData),
  updateLevel: (id, levelData) => apiClient.put(`/levels/${id}`, levelData),
  deleteLevel: (id) => apiClient.delete(`/levels/${id}`)
};

// Teacher Level API endpoints
export const teacherLevelAPI = {
  getAllTeacherLevels: () => apiClient.get('/teacher_level'),
  getTeacherLevelById: (id) => apiClient.get(`/teacher_level/${id}`),
  createTeacherLevel: (data) => apiClient.post('/teacher_level', data),
  updateTeacherLevel: (id, data) => apiClient.put(`/teacher_level/${id}`, data),
  deleteTeacherLevel: (id) => apiClient.delete(`/teacher_level/${id}`)
};

// Auth API endpoints
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getProfile: () => apiClient.get('/auth/profile'),
  logout: () => apiClient.post('/auth/logout'),
  
  /**
   * Request OTP for password reset or change
   * @param {Object} data - { address: string, phone: string, channel: 'email' | 'whatsapp' }
   * @returns {Promise} - { success: boolean, message: string }
   */
  requestOtp: (data) => apiClient.post('/auth/request-otp', data),
  
  /**
   * Verify OTP code
   * @param {Object} data - { address: string, phone: string, channel: 'email' | 'whatsapp', otp: string }
   * @returns {Promise} - { success: boolean, resetToken: string }
   */
  verifyOtp: (data) => apiClient.post('/auth/verify-otp', data),
  
  /**
   * Change password using reset token
   * @param {Object} data - { resetToken: string, newPassword: string }
   * @returns {Promise} - { success: boolean, message: string }
   */
  changePassword: (data) => apiClient.post('/auth/change-password', data)
};

// Report Files API endpoints
export const reportFileAPI = {
  /** Upload grade report file */
  uploadReportFile: (studentid, gradeid, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentid', studentid);
    formData.append('gradeid', gradeid);
    return apiClient.post('/report_files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getAllReportFiles: () => apiClient.get('/report_files'),
  getReportFileById: (id) => apiClient.get(`/report_files/${id}`)
};

// Grade API endpoints
export const gradeAPI = {
  getAllGrades: () => apiClient.get('/grades'),
  getGradeById: (id) => apiClient.get(`/grades/${id}`),
  createGrade: (gradeData, file = null) => {
    const formData = new FormData();
    
    Object.keys(gradeData).forEach(key => {
      if (gradeData[key] !== null && gradeData[key] !== undefined) {
        formData.append(key, gradeData[key]);
      }
    });
    
    if (file) {
      formData.append('file', file);
    }
    
    return apiClient.post('/grades', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateGrade: (id, gradeData, file = null) => {
    const formData = new FormData();
    
    Object.keys(gradeData).forEach(key => {
      if (gradeData[key] !== null && gradeData[key] !== undefined) {
        formData.append(key, gradeData[key]);
      }
    });
    
    if (file) {
      formData.append('file', file);
    }
    
    return apiClient.put(`/grades/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteGrade: (id) => apiClient.delete(`/grades/${id}`),
  downloadCertificate: (gradeId) => apiClient.get(`/grades/${gradeId}/certificate`, {
    responseType: 'blob'
  })
};

// Course Files API endpoints
export const courseFileAPI = {
  getAllCourseFiles: () => apiClient.get('/course_files'),
  getCourseFileById: (id) => apiClient.get(`/course_files/${id}`),
  deleteCourseFile: (id) => apiClient.delete(`/course_files/${id}`)
};

// Dashboard API endpoints
export const dashboardAPI = {
  getRecentActivity: () => apiClient.get('/dashboard/recent-activity')
};

// Payment API endpoints
export const paymentAPI = {
  /**
   * Generate Midtrans Snap payment token
   * @param {Object} paymentData - { email, amount, name, studentid, payment_type }
   * @returns {Promise} - { success, redirect_url, token, order_id }
   */
  generateToken: (paymentData) => apiClient.post('/payment/generate', paymentData),
  
  /**
   * Get payment history for a student
   * @param {number} studentid - Student ID
   * @returns {Promise} - { success, data: [] }
   */
  getPaymentHistory: (studentid) => apiClient.get(`/payment/history/${studentid}`),
  
  /**
   * Get all payments (admin only)
   * @returns {Promise} - { success, data: [] }
   */
  getAllPayments: () => apiClient.get('/payment/history'),
  
  /**
   * Refresh payment status for a student
   * @param {number} studentid - Student ID
   * @returns {Promise} - { success, message }
   */
  refreshPaymentStatus: (studentid) => apiClient.put(`/payment/refresh/${studentid}`)
  // Note: Webhook endpoint removed - payment webhooks should only be called by Midtrans to the backend directly
};

export default apiClient;