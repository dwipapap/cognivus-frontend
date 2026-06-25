import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockAuthStore = vi.hoisted(() => ({
  isAuthenticated: vi.fn(() => false),
  role: null,
  user: null
}))

vi.mock('../../store/auth', () => ({ authStore: mockAuthStore }))

const { default: router } = await import('../index')

describe('production router configuration', () => {
  beforeEach(async () => {
    mockAuthStore.isAuthenticated.mockReturnValue(false)
    mockAuthStore.role = null
    mockAuthStore.user = null
    await router.replace('/')
  })

  it('resolves the real public routes', () => {
    expect(router.resolve('/').name).toBe('Home')
    expect(router.resolve('/login').name).toBe('Login')
    expect(router.resolve('/auth/callback').name).toBe('GoogleCallback')
  })

  it('inherits authentication metadata on nested role routes', () => {
    const studentRoute = router.resolve('/student/payment')
    const lecturerRoute = router.resolve('/lecturer/materials')
    const adminRoute = router.resolve('/admin/payments')

    expect(studentRoute.meta.requiresAuth).toBe(true)
    expect(studentRoute.meta.role).toBe('student')
    expect(lecturerRoute.meta).toMatchObject({
      requiresAuth: true,
      role: 'lecturer'
    })
    expect(adminRoute.meta).toMatchObject({
      requiresAuth: true,
      roles: ['owner', 'admin', 'moderator']
    })
  })

  it('keeps the configured legacy student redirects', () => {
    expect(router.resolve('/dashboardstudent').redirectedFrom).toBeUndefined()

    const legacyRoute = router.getRoutes().find((route) => route.path === '/dashboardstudent')
    expect(legacyRoute?.redirect).toBe('/student/dashboard')
  })

  it('resolves unknown URLs to the production not-found page', () => {
    const unknownRoute = router.resolve('/does-not-exist')
    expect(unknownRoute.name).toBe('NotFound')
    expect(unknownRoute.matched).toHaveLength(1)
  })

  it('redirects an authenticated admin away from student routes', async () => {
    mockAuthStore.isAuthenticated.mockReturnValue(true)
    mockAuthStore.role = 'admin'

    await router.push('/student/payment')

    expect(router.currentRoute.value.name).toBe('AdminDashboard')
  })

  it('redirects guests from protected routes to login', async () => {
    await router.push('/lecturer/materials')

    expect(router.currentRoute.value.name).toBe('Login')
  })
})
