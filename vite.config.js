import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import Icons from 'unplugin-icons/vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    ui({
      colorMode: false,
      colors: {
        primary: 'blue',
        neutral: 'slate'
      },
      button: {
        defaultVariants: {
          class: 'rounded-full shadow-md'
        }
      },
      modal: {
        slots: {
          content: 'rounded-3xl'
        }
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
          'vendor-ui': ['@nuxt/ui']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'axios', '@nuxt/ui'],
    exclude: ['@tailwindcss/oxide']
  }
})
