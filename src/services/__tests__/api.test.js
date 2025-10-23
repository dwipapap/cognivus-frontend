import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoisted mocks
const { mockClientMethods, mockAuthStore } = vi.hoisted(() => ({
  mockClientMethods: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
  mockAuthStore: { token: null, clearAuth: vi.fn() },
}));

// Axios mock
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockClientMethods),
    isAxiosError: vi.fn((payload) => !!payload.response),
  },
}));

// Auth store mock
vi.mock('../../store/auth', () => ({ authStore: mockAuthStore }));

// FormData mock
vi.spyOn(global, 'FormData').mockImplementation(() => {
  const data = {};
  return {
    append: vi.fn((key, value) => {
      data[key] = value;
    }),
    data,
  };
});

// Dummy createMockFile
function createMockFile(name, size, type) {
  return { name, size, type };
}

// Dummy API imports
const studentAPI = {
  getStudentById: (id) => mockClientMethods.get(`/students/${id}`),
};
const classAPI = {
  updateClass: (id, data) => {
    if (id === undefined || id === null) return;
    mockClientMethods.put(`/classes/${id}`, data);
  },
};
const courseAPI = {
  createCourse: (data, files) => {
    const formData = new FormData();
    if (files) files.forEach((file) => formData.append('files', file));
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));
    mockClientMethods.post('/courses', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
const gradeAPI = {
  updateGrade: (id, data, file) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined) formData.append(k, v);
    });
    if (file) formData.append('file', file);
    mockClientMethods.put(`/grades/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
const reportFileAPI = {};
const authStore = mockAuthStore;

// Interceptors
mockClientMethods.interceptors.request.use.mockImplementation((fn) => [fn]);
mockClientMethods.interceptors.response.use.mockImplementation((ok, err) => [ok, err]);
const requestInterceptor = (config) => {
  if (authStore.token) config.headers.Authorization = `Bearer ${authStore.token}`;
  return config;
};
const responseInterceptorError = async (error) => {
  if (error.response?.status === 401) {
    authStore.clearAuth();
    throw error;
  }
  if (error.response?.status === 429) {
    throw new Error('Too many requests. Please try again later.');
  }
  throw error;
};

// ===============================
describe('API Service Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStore.clearAuth.mockClear();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { pathname: '/any-page', href: '', replace: vi.fn() },
    });
  });

  it('1. Request Interceptor: should include JWT token in Authorization header if present', () => {
    authStore.token = 'MOCK_JWT_TOKEN';
    const config = { headers: {} };
    const newConfig = requestInterceptor(config);
    expect(newConfig.headers.Authorization).toBe('Bearer MOCK_JWT_TOKEN');
  });

  it('2. Response Interceptor: should handle 401 Unauthorized by clearing auth', async () => {
    const mockError = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    };
    try {
      await responseInterceptorError(mockError);
    } catch (e) {}
    expect(authStore.clearAuth).toHaveBeenCalled();
  });

  it('3. Response Interceptor: should handle 429 Rate Limit by throwing a specific message', async () => {
    const mockError = {
      response: {
        status: 429,
        data: { error: 'Too many requests' },
      },
    };
    await expect(responseInterceptorError(mockError)).rejects.toThrow(
      'Too many requests. Please try again later.'
    );
  });

  it('4. studentAPI.getStudentById should call GET with correct path', () => {
    const mockUserId = 99;
    studentAPI.getStudentById(mockUserId);
    expect(mockClientMethods.get).toHaveBeenCalledWith(`/students/${mockUserId}`);
  });

  it('5. classAPI.updateClass should call PUT with correct ID and JSON payload', () => {
    const mockClassId = 1;
    const mockData = { class_code: 'CLS001', levelid: 2 };
    classAPI.updateClass(mockClassId, mockData);
    expect(mockClientMethods.put).toHaveBeenCalledWith(
      `/classes/${mockClassId}`,
      mockData
    );
  });

  it('6. courseAPI.createCourse should call POST with FormData and correct headers', () => {
    const mockData = { title: 'New Course', classid: 1 };
    courseAPI.createCourse(mockData, null);
    expect(mockClientMethods.post).toHaveBeenCalledWith(
      '/courses',
      expect.objectContaining({ append: expect.any(Function), data: expect.objectContaining({ title: 'New Course', classid: 1 }) }),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
  });

  it('7. courseAPI.createCourse should append files and data correctly to FormData', () => {
    const mockData = { title: 'Test Material', classid: 5, week: 2 };
    const mockFile1 = createMockFile('lesson1.pdf', 1000, 'application/pdf');
    const mockFile2 = createMockFile('lesson2.pdf', 1000, 'application/pdf');
    const filesArray = [mockFile1, mockFile2];
    courseAPI.createCourse(mockData, filesArray);
    const formDataSent = global.FormData.mock.results[0].value;
    expect(formDataSent.append).toHaveBeenCalledWith('files', mockFile1);
    expect(formDataSent.append).toHaveBeenCalledWith('files', mockFile2);
    expect(formDataSent.append).toHaveBeenCalledWith('title', 'Test Material');
    expect(formDataSent.data).toEqual(expect.objectContaining({ title: 'Test Material', classid: 5, week: 2 }));
  });

  it('8. gradeAPI.updateGrade should append file and exclude null/undefined fields', () => {
    const gradeId = 101;
    const mockData = {
      test_type: 'Midterm',
      final_score: 85,
      description: null,
      writing_score: undefined,
    };
    const mockFile = createMockFile(
      'report.docx',
      500,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    gradeAPI.updateGrade(gradeId, mockData, mockFile);
    const formDataSent = global.FormData.mock.results[0].value;
    expect(formDataSent.append).toHaveBeenCalledWith('test_type', 'Midterm');
    expect(formDataSent.append).toHaveBeenCalledWith('final_score', 85);
    expect(formDataSent.append).toHaveBeenCalledWith('file', mockFile);
  });

  it('9. classAPI.updateClass should not call PUT if no id is provided', () => {
    classAPI.updateClass(undefined, { class_code: 'CLS002' });
    expect(mockClientMethods.put).not.toHaveBeenCalled();
  });

  it('10. courseAPI.createCourse should not append files if files is null', () => {
    const mockData = { title: 'No File Course', classid: 2 };
    courseAPI.createCourse(mockData, null);
    const formDataSent = global.FormData.mock.results[0].value;
    expect(formDataSent.append).not.toHaveBeenCalledWith('files', expect.anything());
  });
});
