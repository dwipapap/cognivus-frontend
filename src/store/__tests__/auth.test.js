/**
 * Unit Tests for Auth Store
 * Tests realistic daily user scenarios for authentication
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { authStore } from '../auth'
import secureStorage from '../../utils/secureStorage'

describe('Auth Store - Real User Scenarios', () => {
  // Mock user data
  const mockUser = {
    id: 1,
    email: 'student@test.com',
    user_metadata: { role: 'student' }
  }
  const mockToken = 'mock-jwt-token-12345'
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

    // Verifikasi: Token expiry di-set (3 jam dari sekarang)
    expect(authStore.tokenExpiry).toBeGreaterThan(Date.now())

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
    expect(authStore.hasRole('lecturer')).toBe(true)
    expect(authStore.hasRole('student')).toBe(false)

    // Verifikasi: Lecturer punya akses berbeda dari student
    expect(authStore.hasAnyRole(['lecturer', 'admin'])).toBe(true)
    expect(authStore.hasAnyRole(['student', 'moderator'])).toBe(false)
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
  // Scenario 5: Check Token Time Remaining
  // =====================================
  it('should calculate time remaining until token expires', () => {
    // User login dan mau tahu berapa lama lagi token valid
    authStore.setAuth(mockUser, mockToken, 'student')

    const timeRemaining = authStore.getTimeRemaining()

    // Verifikasi: Waktu tersisa sekitar 3 jam (dengan toleransi)
    expect(timeRemaining).not.toBeNull()
    expect(timeRemaining.hours).toBeGreaterThanOrEqual(2)
    expect(timeRemaining.hours).toBeLessThanOrEqual(3)
    expect(timeRemaining.minutes).toBeGreaterThanOrEqual(0)
    expect(timeRemaining.minutes).toBeLessThan(60)
    expect(timeRemaining.totalMs).toBeGreaterThan(0)
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
  // Scenario 7: Access Control - Student Cannot Access Lecturer Page
  // =====================================
  it('should prevent student from accessing lecturer-only features', () => {
    // Student login
    authStore.setAuth(mockUser, mockToken, 'student')

    // Student mencoba akses halaman lecturer
    const canAccessLecturer = authStore.hasRole('lecturer')
    const canAccessAdmin = authStore.hasRole('admin')

    // Verifikasi: Akses ditolak
    expect(canAccessLecturer).toBe(false)
    expect(canAccessAdmin).toBe(false)

    // Tapi bisa akses halaman student
    expect(authStore.hasRole('student')).toBe(true)
  })

  // =====================================
  // Scenario 8: Multiple Role Check (Admin Access)
  // =====================================
  it('should check if user has any of multiple roles', () => {
    // Simulasi: Admin login
    const adminUser = { ...mockUser, user_metadata: { role: 'admin' } }
    authStore.setAuth(adminUser, mockToken, 'admin')

    // Cek apakah admin punya akses ke halaman tertentu
    const canAccessAdminOrOwner = authStore.hasAnyRole(['admin', 'owner'])
    const canAccessLecturerOrStudent = authStore.hasAnyRole(['lecturer', 'student'])

    // Verifikasi: Admin hanya punya akses admin/owner
    expect(canAccessAdminOrOwner).toBe(true)
    expect(canAccessLecturerOrStudent).toBe(false)
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
    const timeRemaining = authStore.getTimeRemaining()

    // Verifikasi: Token masih valid
    expect(isExpired).toBe(false)
    expect(isAuth).toBe(true)
    expect(timeRemaining.hours).toBeGreaterThanOrEqual(2)
  })

  // =====================================
  // Scenario 10: Unauthenticated User (Guest)
  // =====================================
  it('should handle unauthenticated user trying to access protected routes', () => {
    // User belum login (guest)
    // authStore dalam keadaan kosong

    // User mencoba akses halaman yang butuh login
    const isAuth = authStore.isAuthenticated()
    const hasRole = authStore.hasRole('student')
    const hasAnyRole = authStore.hasAnyRole(['student', 'lecturer', 'admin'])

    // Verifikasi: Semua akses ditolak
    expect(isAuth).toBe(false)
    expect(hasRole).toBe(false)
    expect(hasAnyRole).toBe(false)
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()

    // Router harus redirect ke /login
  })
})
