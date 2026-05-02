// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // SPA mode - critical for localStorage auth safety
  ssr: false,

  // Preserve existing src/ folder structure
  srcDir: 'src/',

  // Nuxt 4 compatibility
  compatibilityDate: '2025-05-15',

  // Modules
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
  ],

  // CSS entry point
  css: ['~/assets/main.css'],

  // Icon configuration (replaces unplugin-icons)
  // NuxtUI uses Iconify natively - same icon sets, different syntax
  icon: {
    collections: ['basil', 'solar', 'svg-spinners'],
  },

  // App head configuration (replaces index.html)
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'ITTR English Course',
      link: [
        { rel: 'icon', type: 'image', href: '/ittrlogo.webp' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap',
        },
      ],
    },
  },

  // File-based routing enabled (Phase 2)
  pages: true,

  // Component auto-import - disable path prefix so components/admin/ClassForm.vue
  // is available as <ClassForm> (not <AdminClassForm>)
  components: {
    dirs: [
      { path: '~/components', pathPrefix: false },
    ],
  },

  // Pinia configuration
  pinia: {
    storesDirs: ['src/store/**'],
  },

  // DevTools
  devtools: { enabled: true },
});
