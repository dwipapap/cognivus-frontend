import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  client: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  },
  authStore: {
    token: null,
    clearAuth: vi.fn()
  },
  requestInterceptor: null,
  responseErrorInterceptor: null
}))

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mocks.client)
  }
}))

vi.mock('../../store/auth', () => ({ authStore: mocks.authStore }))

mocks.client.interceptors.request.use.mockImplementation((handler) => {
  mocks.requestInterceptor = handler
})
mocks.client.interceptors.response.use.mockImplementation((_success, error) => {
  mocks.responseErrorInterceptor = error
})

const {
  classAPI,
  courseAPI,
  gradeAPI,
  studentAPI
} = await import('../api')

describe('production API service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.authStore.token = null
  })

  it('adds the current bearer token through the production request interceptor', () => {
    mocks.authStore.token = 'token-value'

    const config = mocks.requestInterceptor({ headers: {} })

    expect(config.headers.Authorization).toBe('Bearer token-value')
  })

  it('clears authentication through the production 401 interceptor', async () => {
    const error = { response: { status: 401 } }

    await expect(mocks.responseErrorInterceptor(error)).rejects.toBe(error)
    expect(mocks.authStore.clearAuth).toHaveBeenCalledOnce()
  })

  it('normalizes production rate-limit errors', () => {
    const error = {
      response: {
        status: 429,
        data: { error: 'Try again later' }
      }
    }

    expect(() => mocks.responseErrorInterceptor(error))
      .toThrow('Try again later')
  })

  it('uses the real student endpoint definition', () => {
    studentAPI.getStudentById(99)
    expect(mocks.client.get).toHaveBeenCalledWith('/students/99')
  })

  it('uses the real class update endpoint definition', () => {
    const payload = { class_code: 'CLS001', levelid: 2 }
    classAPI.updateClass(1, payload)
    expect(mocks.client.put).toHaveBeenCalledWith('/classes/1', payload)
  })

  it('builds production course multipart requests', () => {
    const file = new File(['lesson'], 'lesson.pdf', { type: 'application/pdf' })
    courseAPI.createCourse({ title: 'Lesson', classid: 5 }, [file])

    const [url, formData, options] = mocks.client.post.mock.calls[0]
    expect(url).toBe('/courses')
    expect(formData.get('title')).toBe('Lesson')
    expect(formData.get('classid')).toBe('5')
    expect(formData.getAll('files')).toEqual([file])
    expect(options).toEqual({
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  })

  it('excludes null fields from production grade multipart requests', () => {
    const file = new File(['report'], 'report.pdf', { type: 'application/pdf' })
    gradeAPI.updateGrade(101, {
      test_type: 'Midterm',
      final_score: 85,
      description: null,
      writing_score: undefined
    }, file)

    const [url, formData] = mocks.client.put.mock.calls[0]
    expect(url).toBe('/grades/101')
    expect(formData.get('test_type')).toBe('Midterm')
    expect(formData.get('final_score')).toBe('85')
    expect(formData.has('description')).toBe(false)
    expect(formData.has('writing_score')).toBe(false)
    expect(formData.get('file')).toBe(file)
  })
})
