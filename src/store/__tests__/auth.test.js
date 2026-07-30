/**
 * Unit Tests for Auth Store
 * Tests realistic daily user scenarios for authentication
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { authStore, isProtectedRoutePath } from '../auth'
import secureStorage from '../../utils/secureStorage'

const encodeJwtPart = (value) => btoa(JSON.stringify(value))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/g, '')

const createJwt = (expiresAt) => [
  encodeJwtPart({ alg: 'none', typ: 'JWT' }),
  encodeJwtPart({ exp: expiresAt }),
  'signature'
].join('.')

describe('Auth Store - Real User Scenarios', () => {
  // Mock user data
  const mockUser = {
    id: 1,
    email: 'student@test.com',
    user_metadata: { role: 'student' }
  }
  const mockTokenExpiry = Math.floor(Date.now() / 1000) + (3 * 60 * 60)
  const mockToken = createJwt(mockTokenExpiry)
  const mockLecturerUser = {
    id: 2,
    email: 'lecturer@test.com',
    user_metadata: { role: 'lecturer' }
  }

  beforeEach(() => {
    // Clear all auth data before each test
    authStore.clearAuth()
    vi.clearAllMocks()

    // Mock Supabase
    vi.mock('../../supabase', () => ({
      supabase: {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
          onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
          signOut: vi.fn().mockResolvedValue({})
        }
      }
    }))
  })

  afterEach(() => {
    authStore.stopExpiryCheck()
    vi.restoreAllMocks()
  })

  // =====================================
  // Scenario 1: User Login Sukses (Happy Path)
  // =====================================
  it('should successfully login student and store auth data', () => {
    // User mengisi form login dan klik tombol login
    authStore.setAuth(mockUser, mockToken, 'student')

    // Verifikasi: Data tersimpan dengan benar
    expect(authStore.user).toEqual(mockUser)
    expect(authStore.token).toBe(mockToken)
    expect(authStore.role).toBe('student')
    expect(authStore.isAuthenticated()).toBe(true)

    // Verifikasi: Token expiry follows the JWT exp claim
    expect(authStore.tokenExpiry).toBe(mockTokenExpiry * 1000)

    // Verifikasi: Data tersimpan di localStorage (encrypted)
    expect(secureStorage.getItem('token')).toBe(mockToken)
    expect(secureStorage.getItem('role')).toBe('student')
  })

  // =====================================
  // Scenario 2: Lecturer Login (Different Role)
  // =====================================
  it('should handle lecturer login with correct role', () => {
    // Lecturer login dengan kredensial yang benar
    authStore.setAuth(mockLecturerUser, mockToken, 'lecturer')

    // Verifikasi: Role lecturer tersimpan
    expect(authStore.role).toBe('lecturer')
  })

  // =====================================
  // Scenario 3: User Logout Manual
  // =====================================
  it('should clear all data when user clicks logout', () => {
    // Setup: User sudah login
    authStore.setAuth(mockUser, mockToken, 'student')
    expect(authStore.isAuthenticated()).toBe(true)

    // User klik tombol "Logout"
    authStore.clearAuth()

    // Verifikasi: Semua data hilang
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
    expect(authStore.role).toBeNull()
    expect(authStore.tokenExpiry).toBeNull()
    expect(authStore.isAuthenticated()).toBe(false)

    // Verifikasi: localStorage juga terhapus
    expect(secureStorage.getItem('token')).toBeNull()
    expect(secureStorage.getItem('user')).toBeNull()
  })

  // =====================================
  // Scenario 4: Token Expired (Auto Logout)
  // =====================================
  it('should detect expired token and return not authenticated', () => {
    // Setup: User login kemarin (token sudah expired)
    authStore.setAuth(mockUser, mockToken, 'student')

    // Simulasi: Token expired (set waktu ke masa lalu)
    const expiredTime = Date.now() - (1 * 60 * 60 * 1000) // 1 jam yang lalu
    authStore.tokenExpiry = expiredTime
    secureStorage.setItem('tokenExpiry', expiredTime)

    // User buka aplikasi lagi setelah token expired
    const isExpired = authStore.isTokenExpired()
    const isAuth = authStore.isAuthenticated()

    // Verifikasi: Token terdeteksi expired
    expect(isExpired).toBe(true)
    expect(isAuth).toBe(false)
  })

  // =====================================
  // Scenario 6: Refresh Browser (Persistence)
  // =====================================
  it('should restore auth state after browser refresh', () => {
    // Setup: User login
    authStore.setAuth(mockUser, mockToken, 'student')

    // Simulasi: User refresh browser (auth store di-reset)
    const savedToken = secureStorage.getItem('token')
    const savedRole = secureStorage.getItem('role')
    const savedUser = secureStorage.getItem('user')

    authStore.user = null
    authStore.token = null
    authStore.role = null

    // Simulasi: App restore dari localStorage
    authStore.token = savedToken
    authStore.role = savedRole
    authStore.user = savedUser

    // Verifikasi: Data ter-restore dengan benar
    expect(authStore.token).toBe(mockToken)
    expect(authStore.role).toBe('student')
    expect(authStore.user).toEqual(mockUser)
    expect(authStore.isAuthenticated()).toBe(true)
  })

  // =====================================
  // Scenario 9: Token Still Valid (Not Expired)
  // =====================================
  it('should confirm token is still valid within expiry time', () => {
    // User baru login 30 menit yang lalu
    authStore.setAuth(mockUser, mockToken, 'student')

    // Set token expiry 2.5 jam dari sekarang (masih 2.5 jam lagi)
    const futureExpiry = Date.now() + (2.5 * 60 * 60 * 1000)
    authStore.tokenExpiry = futureExpiry
    secureStorage.setItem('tokenExpiry', futureExpiry)

    // User melakukan aktivitas (API call, navigate, dll)
    const isExpired = authStore.isTokenExpired()
    const isAuth = authStore.isAuthenticated()

    // Verifikasi: Token masih valid
    expect(isExpired).toBe(false)
    expect(isAuth).toBe(true)
  })

  // =====================================
  // Scenario 10: Unauthenticated User (Guest)
  // =====================================
  it('should handle unauthenticated user trying to access protected routes', () => {
    // User belum login (guest)
    // authStore dalam keadaan kosong

    // User mencoba akses halaman yang butuh login
    const isAuth = authStore.isAuthenticated()

    // Verifikasi: Semua akses ditolak
    expect(isAuth).toBe(false)
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()

    // Router harus redirect ke /login
  })

  it('should not invent an expiry for an opaque token', () => {
    authStore.setAuth(mockUser, 'opaque-session-token', 'student')

    expect(authStore.tokenExpiry).toBeNull()
    expect(secureStorage.getItem('tokenExpiry')).toBeNull()
    expect(authStore.isAuthenticated()).toBe(true)
  })

  it.each([
    '/student/dashboard',
    '/lecturer/materials',
    '/admin/payments',
    '/new-user'
  ])('should identify %s as protected for expiry redirects', (path) => {
    expect(isProtectedRoutePath(path)).toBe(true)
  })

  it('should clear and redirect an expired admin session', () => {
    vi.useFakeTimers()
    const now = new Date('2026-06-25T08:00:00.000Z')
    vi.setSystemTime(now)
    window.history.pushState({}, '', '/admin/dashboard')

    const token = createJwt(Math.floor(now.getTime() / 1000) + 30)
    const redirectSpy = vi
      .spyOn(authStore, 'redirectToLogin')
      .mockImplementation(() => {})

    authStore.setAuth(mockUser, token, 'admin')
    authStore.startExpiryCheck()
    vi.advanceTimersByTime(60000)

    expect(authStore.token).toBeNull()
    expect(redirectSpy).toHaveBeenCalledOnce()

    vi.useRealTimers()
  })
})
