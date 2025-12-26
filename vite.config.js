import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Icons from 'unplugin-icons/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Icons({
      compiler: 'vue3',
      autoInstall: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    // Use esbuild for faster builds (10-100x faster than Terser)
    // Size difference is minimal (~2-5% larger) but build time is significantly faster
    minify: 'esbuild',
    
    // Don't report compressed size (speeds up build)
    reportCompressedSize: false,
    
    // Disable sourcemaps in production (security + size)
    sourcemap: false,
    
    // Manual code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries (changes less frequently)
          'vendor-vue': ['vue', 'vue-router'],
          'vendor-http': ['axios'],
          'vendor-crypto': ['crypto-js'],
          'vendor-ui': ['flowbite', 'gsap'],
          'vendor-pdf': ['@tato30/vue-pdf']
        }
      }
    }
  },
  
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: ['vue', 'vue-router', 'axios'],
    exclude: []
  }
})
