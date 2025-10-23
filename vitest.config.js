import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

/**
 * Vitest Configuration
 * Merges with existing Vite config to ensure consistency
 * @see https://vitest.dev/config/
 */
export default mergeConfig(viteConfig, defineConfig({
  test: {
    // Use happy-dom for faster DOM simulation (lighter than jsdom)
    environment: 'happy-dom',
    
    // Enable global test APIs (describe, it, expect, vi, etc.)
    // This allows using test functions without importing them
    globals: true,
    
    // Setup files to run before each test file
    setupFiles: ['./src/tests/setup.js'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8', // Fast native coverage
      reporter: ['text', 'json', 'html', 'lcov'],
      
      // Files to exclude from coverage
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.spec.js',
        '**/*.test.js',
        '**/mockData.js',
        '**/mock*.js',
        '**/__tests__/**',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
        'vite.config.js',
        'vitest.config.js',
        'tailwind.config.js'
      ],
      
      // Coverage thresholds (uncomment to enforce)
      // thresholds: {
      //   lines: 60,
      //   functions: 60,
      //   branches: 60,
      //   statements: 60
      // }
    },
    
    // Include patterns for test files
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      '**/node_modules/**',
      '**/dist/**'
    ],
    
    // Test timeout (milliseconds)
    testTimeout: 10000,
    
    // Hook timeout (milliseconds)
    hookTimeout: 10000,
    
    // Allow only .only tests in development
    allowOnly: process.env.NODE_ENV !== 'production',
    
    // Watch options
    watch: true,
    
    // Reporter configuration
    reporters: ['verbose'],
    
    // Inline snapshots
    resolveSnapshotPath: (testPath, snapExtension) => {
      return testPath.replace(/\.test\.([tj]sx?)/, `${snapExtension}.$1`)
    },
  },
}))
