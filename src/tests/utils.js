/**
 * Test Utilities and Helpers
 * Reusable functions for testing Vue components and composables
 */

import { mount, flushPromises } from '@vue/test-utils'
import { vi } from 'vitest'
import { nextTick } from 'vue'

/**
 * Create a wrapper for mounting components with common options
 * @param {Object} component - Vue component to mount
 * @param {Object} options - Mount options
 * @returns {Object} Wrapper instance
 */
export function createWrapper(component, options = {}) {
  const defaultOptions = {
    global: {
      mocks: {
        $router: {
          push: vi.fn(),
          replace: vi.fn(),
        },
        $route: {
          path: '/',
          params: {},
          query: {},
        },
      },
      stubs: {
        // Add common stubs here
      },
    },
  }

  return mount(component, {
    ...defaultOptions,
    ...options,
    global: {
      ...defaultOptions.global,
      ...options.global,
    },
  })
}

/**
 * Wait for async operations and DOM updates
 * Combines nextTick and flushPromises for convenience
 */
export async function waitFor(callback, { timeout = 3000, interval = 50 } = {}) {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    try {
      await nextTick()
      await flushPromises()
      
      const result = callback()
      if (result) {
        return result
      }
    } catch (error) {
      // Continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  throw new Error('waitFor timeout exceeded')
}

/**
 * Mock axios responses
 * @param {Object} responses - Object with url patterns and responses
 * @returns {Function} Mock function
 */
export function mockAxios(responses = {}) {
  return vi.fn((config) => {
    const url = config.url || config
    
    for (const [pattern, response] of Object.entries(responses)) {
      if (url.includes(pattern)) {
        if (response instanceof Error) {
          return Promise.reject(response)
        }
        return Promise.resolve({ data: response })
      }
    }
    
    return Promise.reject(new Error(`No mock response for ${url}`))
  })
}

/**
 * Create mock API client
 * @param {Object} mockResponses - Mock responses by endpoint
 * @returns {Object} Mock API client
 */
export function createMockAPI(mockResponses = {}) {
  const api = {}
  
  for (const [method, response] of Object.entries(mockResponses)) {
    api[method] = vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: response,
      },
    })
  }
  
  return api
}

/**
 * Create mock auth store
 * @param {Object} initialState - Initial auth state
 * @returns {Object} Mock auth store
 */
export function createMockAuthStore(initialState = {}) {
  return {
    user: initialState.user || null,
    token: initialState.token || null,
    role: initialState.role || null,
    isAuthenticated: initialState.isAuthenticated || false,
    setAuth: vi.fn((user, token, role) => {
      this.user = user
      this.token = token
      this.role = role
      this.isAuthenticated = true
    }),
    clearAuth: vi.fn(() => {
      this.user = null
      this.token = null
      this.role = null
      this.isAuthenticated = false
    }),
    isTokenExpired: vi.fn(() => false),
  }
}

/**
 * Mock localStorage with spy functions
 * @returns {Object} Mock localStorage
 */
export function createMockLocalStorage() {
  const store = {}
  
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value)
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    get length() {
      return Object.keys(store).length
    },
  }
}

/**
 * Create mock router
 * @param {Object} options - Router options
 * @returns {Object} Mock router
 */
export function createMockRouter(options = {}) {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: {
      value: {
        path: options.currentPath || '/',
        params: options.params || {},
        query: options.query || {},
        name: options.name || null,
      },
    },
  }
}

/**
 * Simulate form input
 * @param {Object} wrapper - Component wrapper
 * @param {string} selector - Input selector
 * @param {string} value - Value to set
 */
export async function fillInput(wrapper, selector, value) {
  const input = wrapper.find(selector)
  await input.setValue(value)
  await input.trigger('blur')
  await flushPromises()
}

/**
 * Simulate form submission
 * @param {Object} wrapper - Component wrapper
 * @param {string} selector - Form selector (default: 'form')
 */
export async function submitForm(wrapper, selector = 'form') {
  const form = wrapper.find(selector)
  await form.trigger('submit')
  await flushPromises()
}

/**
 * Get element by test ID
 * @param {Object} wrapper - Component wrapper
 * @param {string} testId - Test ID attribute value
 * @returns {Object} Element wrapper
 */
export function getByTestId(wrapper, testId) {
  return wrapper.find(`[data-testid="${testId}"]`)
}

/**
 * Check if element has class
 * @param {Object} wrapper - Component wrapper
 * @param {string} className - Class name to check
 * @returns {boolean} True if class exists
 */
export function hasClass(wrapper, className) {
  return wrapper.classes().includes(className)
}

/**
 * Mock successful API response
 * @param {*} data - Response data
 * @returns {Object} API response object
 */
export function mockApiSuccess(data) {
  return {
    success: true,
    message: 'Success',
    data,
  }
}

/**
 * Mock failed API response
 * @param {string} message - Error message
 * @param {*} error - Error details
 * @returns {Object} API error response object
 */
export function mockApiError(message = 'Error occurred', error = null) {
  return {
    success: false,
    message,
    error,
  }
}

/**
 * Create spy for console methods
 * @param {string} method - Console method to spy on (log, error, warn, etc.)
 * @returns {Object} Spy object
 */
export function spyOnConsole(method = 'error') {
  return vi.spyOn(console, method).mockImplementation(() => {})
}

/**
 * Wait for specific time
 * @param {number} ms - Milliseconds to wait
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Create mock file for file upload tests
 * @param {string} name - File name
 * @param {number} size - File size in bytes
 * @param {string} type - MIME type
 * @returns {File} Mock file object
 */
export function createMockFile(name = 'test.pdf', size = 1024, type = 'application/pdf') {
  const file = new File(['a'.repeat(size)], name, { type })
  return file
}

/**
 * Assert element visibility
 * @param {Object} wrapper - Component wrapper
 * @param {string} selector - Element selector
 * @param {boolean} visible - Expected visibility
 */
export function assertVisible(wrapper, selector, visible = true) {
  const element = wrapper.find(selector)
  
  if (visible) {
    expect(element.exists()).toBe(true)
    expect(element.isVisible()).toBe(true)
  } else {
    expect(element.exists()).toBe(false)
  }
}

/**
 * Mock navigation guard
 * @param {boolean} shouldAllow - Whether to allow navigation
 * @returns {Function} Mock guard function
 */
export function createMockGuard(shouldAllow = true) {
  return vi.fn((to, from, next) => {
    if (shouldAllow) {
      next()
    } else {
      next(false)
    }
  })
}
