import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import Icons from 'unplugin-icons/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ui({
      colors: {
        primary: 'blue',
        neutral: 'slate'
      }
    }),
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
    minify: 'esbuild',
    reportCompressedSize: false,
    sourcemap: false,
    rollupOptions: {
      external: ['@tailwindcss/oxide', 'fsevents'],
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router'],
          'vendor-http': ['axios'],
          'vendor-crypto': ['crypto-js'],
          'vendor-ui': ['@nuxt/ui', 'gsap'],
          'vendor-pdf': ['@tato30/vue-pdf']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'axios', '@nuxt/ui'],
    exclude: ['@tailwindcss/oxide']
  }
})
