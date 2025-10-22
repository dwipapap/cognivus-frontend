/**
 * Vitest Test Setup File
 * Runs before each test file to configure the testing environment
 * @see https://vitest.dev/config/#setupfiles
 */

import { vi } from 'vitest'
import { config } from '@vue/test-utils'

/**
 * Mock window.matchMedia
 * Many CSS-in-JS libraries and responsive components use matchMedia
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

/**
 * Mock IntersectionObserver
 * Used for lazy loading, infinite scrolling, etc.
 */
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

/**
 * Mock ResizeObserver
 * Used for responsive components that track size changes
 */
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

/**
 * Mock localStorage
 * Provides a working localStorage implementation for tests
 */
class LocalStorageMock {
  constructor() {
    this.store = {}
  }

  clear() {
    this.store = {}
  }

  getItem(key) {
    return this.store[key] || null
  }

  setItem(key, value) {
    this.store[key] = String(value)
  }

  removeItem(key) {
    delete this.store[key]
  }

  get length() {
    return Object.keys(this.store).length
  }

  key(index) {
    const keys = Object.keys(this.store)
    return keys[index] || null
  }
}

global.localStorage = new LocalStorageMock()
global.sessionStorage = new LocalStorageMock()

/**
 * Mock fetch API
 * Provides a basic fetch implementation for tests
 */
global.fetch = vi.fn()

/**
 * Mock console methods to reduce noise in tests
 * Uncomment if you want to suppress console output during tests
 */
// global.console = {
//   ...console,
//   error: vi.fn(),
//   warn: vi.fn(),
//   log: vi.fn(),
// }

/**
 * Configure Vue Test Utils globally
 */
config.global.mocks = {
  // Mock i18n if you add it later
  $t: (key) => key,
  
  // Mock router methods
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  },
  
  $route: {
    path: '/',
    params: {},
    query: {},
  },
}

/**
 * Global stubs for common components
 * Add components here that you want to stub globally in all tests
 */
config.global.stubs = {
  // Example: Stub router-link and router-view
  // 'router-link': true,
  // 'router-view': true,
  
  // Stub transition components to make tests synchronous
  transition: false,
  'transition-group': false,
}

/**
 * Configure global provides
 * Add any global provides your app uses
 */
config.global.provide = {
  // Add global provides here if needed
}

/**
 * Reset mocks after each test
 * Ensures clean state between tests
 */
afterEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
})
