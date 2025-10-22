/**
 * Mock Data for Tests
 * Centralized test data that matches your application's data structure
 * Based on your database schema from ITTR Cognivus
 */

/**
 * Mock Users
 */
export const mockUsers = {
  student: {
    userid: 1,
    email: 'student@test.com',
    username: 'student_user',
    fullname: 'Test Student',
    phone: '081234567890',
    address: 'Jakarta, Indonesia',
    photo: null,
    roleid: 1,
    createdat: '2025-01-01T00:00:00.000Z',
  },
  lecturer: {
    userid: 2,
    email: 'lecturer@test.com',
    username: 'lecturer_user',
    fullname: 'Test Lecturer',
    phone: '081234567891',
    address: 'Bandung, Indonesia',
    photo: null,
    roleid: 2,
    createdat: '2025-01-01T00:00:00.000Z',
  },
  admin: {
    userid: 3,
    email: 'admin@test.com',
    username: 'admin_user',
    fullname: 'Test Admin',
    phone: '081234567892',
    address: 'Surabaya, Indonesia',
    photo: null,
    roleid: 4,
    createdat: '2025-01-01T00:00:00.000Z',
  },
}

/**
 * Mock Roles
 */
export const mockRoles = {
  student: { roleid: 1, rolename: 'student' },
  lecturer: { roleid: 2, rolename: 'lecturer' },
  moderator: { roleid: 3, rolename: 'moderator' },
  admin: { roleid: 4, rolename: 'admin' },
  owner: { roleid: 5, rolename: 'owner' },
}

/**
 * Mock Students
 */
export const mockStudents = [
  {
    studentid: 1,
    userid: 1,
    classid: 1,
    status: 'active',
    createdat: '2025-01-01T00:00:00.000Z',
    tbuser: mockUsers.student,
  },
  {
    studentid: 2,
    userid: 4,
    classid: 1,
    status: 'active',
    createdat: '2025-01-02T00:00:00.000Z',
    tbuser: {
      userid: 4,
      email: 'student2@test.com',
      fullname: 'Test Student 2',
      phone: '081234567893',
    },
  },
]

/**
 * Mock Lecturers
 */
export const mockLecturers = [
  {
    lecturerid: 1,
    userid: 2,
    bio: 'Experienced IELTS instructor with 10+ years',
    specialization: 'IELTS Preparation',
    createdat: '2025-01-01T00:00:00.000Z',
    tbuser: mockUsers.lecturer,
  },
]

/**
 * Mock Levels
 */
export const mockLevels = [
  { levelid: 1, levelname: 'Beginner', description: 'Basic English level' },
  { levelid: 2, levelname: 'Intermediate', description: 'Intermediate English level' },
  { levelid: 3, levelname: 'Advanced', description: 'Advanced English level' },
]

/**
 * Mock Programs
 */
export const mockPrograms = [
  { programid: 1, programname: 'Regular', description: 'Regular program' },
  { programid: 2, programname: 'Private', description: 'Private program' },
]

/**
 * Mock Classes
 */
export const mockClasses = [
  {
    classid: 1,
    classname: 'IELTS Beginner Morning',
    levelid: 1,
    programid: 1,
    lecturerid: 1,
    schedule: 'Monday, Wednesday, Friday 09:00-11:00',
    capacity: 15,
    status: 'active',
    createdat: '2025-01-01T00:00:00.000Z',
    tblevel: mockLevels[0],
    tbprogram: mockPrograms[0],
    tblecturer: mockLecturers[0],
  },
  {
    classid: 2,
    classname: 'IELTS Intermediate Evening',
    levelid: 2,
    programid: 1,
    lecturerid: 1,
    schedule: 'Tuesday, Thursday 18:00-20:00',
    capacity: 12,
    status: 'active',
    createdat: '2025-01-01T00:00:00.000Z',
    tblevel: mockLevels[1],
    tbprogram: mockPrograms[0],
    tblecturer: mockLecturers[0],
  },
]

/**
 * Mock Courses
 */
export const mockCourses = [
  {
    courseid: 1,
    classid: 1,
    coursename: 'Introduction to IELTS',
    description: 'Basic IELTS structure and format',
    week: 1,
    createdat: '2025-01-01T00:00:00.000Z',
  },
  {
    courseid: 2,
    classid: 1,
    coursename: 'Reading Skills',
    description: 'IELTS reading comprehension techniques',
    week: 2,
    createdat: '2025-01-01T00:00:00.000Z',
  },
]

/**
 * Mock Course Files
 */
export const mockCourseFiles = [
  {
    fileid: 1,
    courseid: 1,
    filename: 'week1-introduction.pdf',
    filepath: '/uploads/courses/week1-introduction.pdf',
    filetype: 'application/pdf',
    filesize: 1024000,
    createdat: '2025-01-01T00:00:00.000Z',
  },
]

/**
 * Mock Grades
 */
export const mockGrades = [
  {
    gradeid: 1,
    studentid: 1,
    classid: 1,
    listening: 7.5,
    speaking: 7.0,
    reading: 8.0,
    writing: 6.5,
    overall: 7.25,
    testdate: '2025-01-15T00:00:00.000Z',
    createdat: '2025-01-16T00:00:00.000Z',
    tbstudent: mockStudents[0],
  },
]

/**
 * Mock Report Files
 */
export const mockReportFiles = [
  {
    reportid: 1,
    gradeid: 1,
    filename: 'student1-report.pdf',
    filepath: '/uploads/reports/student1-report.pdf',
    filetype: 'application/pdf',
    filesize: 512000,
    createdat: '2025-01-16T00:00:00.000Z',
  },
]

/**
 * Mock Prices
 */
export const mockPrices = [
  {
    priceid: 1,
    levelid: 1,
    programid: 1,
    price: 1500000,
    duration: '3 months',
    description: 'Beginner Regular Program',
    createdat: '2025-01-01T00:00:00.000Z',
  },
  {
    priceid: 2,
    levelid: 2,
    programid: 1,
    price: 2000000,
    duration: '3 months',
    description: 'Intermediate Regular Program',
    createdat: '2025-01-01T00:00:00.000Z',
  },
]

/**
 * Mock API Responses
 */
export const mockApiResponses = {
  success: {
    success: true,
    message: 'Operation successful',
    data: null,
  },
  error: {
    success: false,
    message: 'Operation failed',
    error: 'Error details here',
  },
  unauthorized: {
    success: false,
    message: 'Unauthorized',
    error: 'Invalid or expired token',
  },
  notFound: {
    success: false,
    message: 'Resource not found',
    error: 'The requested resource does not exist',
  },
  validationError: {
    success: false,
    message: 'Validation error',
    error: {
      email: 'Email is required',
      password: 'Password must be at least 6 characters',
    },
  },
}

/**
 * Mock JWT Tokens
 */
export const mockTokens = {
  valid: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzdHVkZW50QHRlc3QuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3MDk1MjAwMDAsImV4cCI6OTk5OTk5OTk5OX0.test',
  expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzdHVkZW50QHRlc3QuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3MDk1MjAwMDAsImV4cCI6MTcwOTUyMDAwMX0.test',
}

/**
 * Mock Form Data
 */
export const mockFormData = {
  login: {
    valid: {
      email: 'student@test.com',
      password: 'password123',
    },
    invalid: {
      email: 'invalid-email',
      password: '123',
    },
  },
  student: {
    valid: {
      email: 'newstudent@test.com',
      fullname: 'New Student',
      phone: '081234567890',
      address: 'Jakarta, Indonesia',
      classid: 1,
    },
    invalid: {
      email: 'invalid-email',
      fullname: 'A',
      phone: 'invalid',
      address: '',
      classid: null,
    },
  },
  lecturer: {
    valid: {
      email: 'newlecturer@test.com',
      fullname: 'New Lecturer',
      phone: '081234567890',
      bio: 'Experienced instructor',
      specialization: 'IELTS',
    },
  },
  grade: {
    valid: {
      studentid: 1,
      classid: 1,
      listening: 7.5,
      speaking: 7.0,
      reading: 8.0,
      writing: 6.5,
      testdate: '2025-01-15',
    },
    invalid: {
      studentid: null,
      classid: null,
      listening: 10.5, // Over 9.0
      speaking: -1, // Negative
      reading: 'invalid',
      writing: null,
    },
  },
}

/**
 * Mock Auth Store State
 */
export const mockAuthState = {
  authenticated: {
    user: mockUsers.student,
    token: mockTokens.valid,
    role: 'student',
    isAuthenticated: true,
  },
  unauthenticated: {
    user: null,
    token: null,
    role: null,
    isAuthenticated: false,
  },
  lecturer: {
    user: mockUsers.lecturer,
    token: mockTokens.valid,
    role: 'lecturer',
    isAuthenticated: true,
  },
  admin: {
    user: mockUsers.admin,
    token: mockTokens.valid,
    role: 'admin',
    isAuthenticated: true,
  },
}

/**
 * Mock Router Paths
 */
export const mockRoutes = {
  home: '/',
  login: '/login',
  student: {
    dashboard: '/student/dashboard',
    profile: '/student/profile',
    courses: '/student/courses',
  },
  lecturer: {
    dashboard: '/lecturer/dashboard',
    profile: '/lecturer/profile',
    students: '/lecturer/students',
    grades: '/lecturer/grades',
  },
  admin: {
    dashboard: '/admin/dashboard',
    students: '/admin/students',
    lecturers: '/admin/lecturers',
    classes: '/admin/classes',
  },
}
