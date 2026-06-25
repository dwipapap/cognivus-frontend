import { flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GoogleCallback from '../GoogleCallback.vue'

const mocks = vi.hoisted(() => ({
  apiGet: vi.fn(),
  clearAuth: vi.fn(),
  replace: vi.fn(),
  setAuth: vi.fn()
}))

vi.mock('../../services/api', () => ({
  default: {
    get: mocks.apiGet
  }
}))

vi.mock('../../store/auth', () => ({
  authStore: {
    clearAuth: mocks.clearAuth,
    setAuth: mocks.setAuth
  }
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    replace: mocks.replace
  })
}))

const callbackUrl = [
  '/auth/callback?token=jwt-token',
  'role=student',
  'id=10',
  'username=student',
  'email=student%40example.com'
].join('&')

const mountCallback = () => shallowMount(GoogleCallback, {
  global: {
    stubs: {
      LoadingSpinner: true,
      UAlert: true
    }
  }
})

describe('GoogleCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    window.history.pushState({}, '', callbackUrl)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('does not persist authentication when account verification fails', async () => {
    mocks.apiGet.mockRejectedValueOnce(new Error('Verification unavailable'))

    mountCallback()
    await flushPromises()

    expect(window.location.search).toBe('')
    expect(mocks.clearAuth).toHaveBeenCalled()
    expect(mocks.setAuth).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(3000)
    expect(mocks.replace).toHaveBeenCalledWith('/login')
  })

  it('persists authentication only after user and student checks succeed', async () => {
    mocks.apiGet
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: { raw_meta_data: { sub: 'google-user' } }
        }
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: { phone: '08123456789', address: 'Jakarta' }
        }
      })

    mountCallback()
    await flushPromises()

    expect(mocks.apiGet).toHaveBeenCalledTimes(2)
    expect(mocks.setAuth).toHaveBeenCalledOnce()
    expect(mocks.apiGet.mock.invocationCallOrder[1]).toBeLessThan(
      mocks.setAuth.mock.invocationCallOrder[0]
    )

    await vi.advanceTimersByTimeAsync(500)
    expect(mocks.replace).toHaveBeenCalledWith('/student/dashboard')
  })

  it('routes verified lecturer accounts without requiring a student profile', async () => {
    window.history.pushState(
      {},
      '',
      callbackUrl.replace('role=student', 'role=lecturer')
    )
    mocks.apiGet.mockResolvedValueOnce({
      data: {
        success: true,
        data: { raw_meta_data: { sub: 'google-lecturer' } }
      }
    })

    mountCallback()
    await flushPromises()

    expect(mocks.apiGet).toHaveBeenCalledOnce()
    expect(mocks.setAuth).toHaveBeenCalledOnce()

    await vi.advanceTimersByTimeAsync(500)
    expect(mocks.replace).toHaveBeenCalledWith('/lecturer/dashboard')
  })
})
