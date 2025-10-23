import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { createMockFile } from '../../tests/utils';

// --- START MOCK SETUP ---

// 1. DEFINE HOLDER OBJECTS: Objek yang akan menjadi mock instance Axios (menggunakan const/let di level atas)
// Ini adalah objek yang akan dikembalikan oleh axios.create() di api.js
const mockClientMethods = {
    get: vi.fn(), 
    post: vi.fn(), 
    put: vi.fn(), 
    delete: vi.fn(),
    interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
    }
};
let mockAuthStore = { token: null, clearAuth: vi.fn() }; 

// 2. MOCK DEPENDENCIES: Factory hanya me-referensi objek yang sudah didefinisikan
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockClientMethods), // Mengembalikan objek mockClientMethods
    isAxiosError: vi.fn((payload) => !!payload.response),
  }
}));

vi.mock('../../store/auth', () => ({ authStore: mockAuthStore }));

// Mock FormData untuk verifikasi file upload
vi.spyOn(global, 'FormData').mockImplementation(() => {
  const data = {};
  return {
    append: vi.fn((key, value) => { data[key] = value; }),
    data: data 
  };
});

// 3. IMPORT MODULE UNDER TEST (Ini akan memicu eksekusi api.js, yang memanggil axios.create())
import { 
  studentAPI, 
  classAPI, 
  courseAPI, 
  gradeAPI,
  reportFileAPI 
} from '../api'; 
import { authStore } from '../../store/auth'; 

// 4. EXTRACT INTERCEPTOR CALLBACKS (Harus dilakukan setelah import)
const requestInterceptor = mockClientMethods.interceptors.request.use.mock.calls[0][0];
const responseInterceptorError = mockClientMethods.interceptors.response.use.mock.calls[0][1];


// --- END MOCK SETUP ---


describe('API Service Core Functionality', () => {

// ----------------------------------------------------
// AXIOS INTERCEPTORS TESTS (Fokus pada Header dan Error)
// ----------------------------------------------------

  beforeEach(() => {
    vi.clearAllMocks();
    authStore.clearAuth.mockClear();
    
    // Mock window.location (untuk Test 2)
    Object.defineProperty(window, 'location', {
        writable: true,
        value: { pathname: '/any-page', href: '', replace: vi.fn() }
    });
  });

  it('1. Request Interceptor: Should include JWT token in Authorization header if present', () => {
    authStore.token = 'MOCK_JWT_TOKEN';
    const config = { headers: {} };
    
    const newConfig = requestInterceptor(config);

    expect(newConfig.headers.Authorization).toBe('Bearer MOCK_JWT_TOKEN');
  });

  it('2. Response Interceptor: Should handle 401 Unauthorized by clearing auth (Logout)', async () => {
    const mockError = {
      response: { 
        status: 401, 
        data: { message: 'Unauthorized' }
      }
    };
    
    try {
      await responseInterceptorError(mockError);
    } catch (e) {
      // do nothing
    }

    expect(authStore.clearAuth).toHaveBeenCalled();
  });

  it('3. Response Interceptor: Should handle 429 Rate Limit error by throwing a specific message', async () => {
    const mockError = {
      response: { 
        status: 429, 
        data: { error: 'Too many requests' },
      }
    };

    await expect(responseInterceptorError(mockError)).rejects.toThrow('Too many requests. Please try again later.');
  });
  
// ----------------------------------------------------
// API ENDPOINTS TESTS (Fokus pada Call Signature & Data)
// ----------------------------------------------------
  
  it('4. studentAPI.getStudentById: Should call GET on the client with the correct path', () => {
    const mockUserId = 99;
    studentAPI.getStudentById(mockUserId);
    
    expect(mockClientMethods.get).toHaveBeenCalledWith(`/students/${mockUserId}`);
  });

  it('5. classAPI.updateClass: Should call PUT with the correct ID and JSON payload', () => {
    const mockClassId = 1;
    const mockData = { class_code: 'CLS001', levelid: 2 };
    classAPI.updateClass(mockClassId, mockData);
    
    expect(mockClientMethods.put).toHaveBeenCalledWith(`/classes/${mockClassId}`, mockData);
  });
  
  it('6. courseAPI.createCourse: Should call POST and pass FormData with correct headers', () => {
    const mockData = { title: 'New Course', classid: 1 };
    
    courseAPI.createCourse(mockData, null);
    
    // Verifikasi bahwa POST dipanggil dengan FormData dan header multipart
    expect(mockClientMethods.post).toHaveBeenCalledWith(
      '/courses',
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    );
  });
  
  it('7. courseAPI.createCourse: Should correctly append array of files and data to FormData', () => {
    const mockData = { title: 'Test Material', classid: 5, week: 2 };
    const mockFile1 = createMockFile('lesson1.pdf', 1000, 'application/pdf');
    const mockFile2 = createMockFile('lesson2.pdf', 1000, 'application/pdf');
    const filesArray = [mockFile1, mockFile2];
    
    courseAPI.createCourse(mockData, filesArray);
    
    const formDataSent = global.FormData.mock.results[0].value;
    
    // Verifikasi files ditambahkan dengan key 'files' (sesuai implementasi API)
    expect(formDataSent.append).toHaveBeenCalledWith('files', mockFile1);
    expect(formDataSent.append).toHaveBeenCalledWith('files', mockFile2);
    expect(formDataSent.append).toHaveBeenCalledWith('title', 'Test Material');
  });

  it('8. gradeAPI.updateGrade: Should append file and exclude null/undefined fields (Clean Data)', () => {
    const gradeId = 101;
    const mockData = { 
        test_type: 'Midterm', 
        final_score: 85, 
        description: null, // Should be excluded 
        writing_score: undefined // Should be excluded
    };
    const mockFile = createMockFile('report.docx', 500, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    gradeAPI.updateGrade(gradeId, mockData, mockFile);
    
    const formDataSent = global.FormData.mock.results[0].value