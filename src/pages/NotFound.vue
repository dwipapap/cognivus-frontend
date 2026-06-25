<script setup>
import { computed } from 'vue'
import { authStore } from '../store/auth'

const dashboardRoute = computed(() => {
  const dashboards = {
    owner: { name: 'AdminDashboard' },
    admin: { name: 'AdminDashboard' },
    moderator: { name: 'AdminDashboard' },
    lecturer: { name: 'LecturerDashboard' },
    student: { name: 'StudentDashboard' }
  }

  return dashboards[authStore.role] || { name: 'Home' }
})

const actionLabel = computed(() => (
  authStore.isAuthenticated() ? 'Return to dashboard' : 'Return home'
))
</script>

<template>
  <main class="min-h-dvh bg-default flex items-center justify-center p-6">
    <UPageCard
      icon="i-lucide-map-pinned"
      title="Page not found"
      description="The page you requested does not exist or may have moved."
      class="w-full max-w-xl text-center"
    >
      <template #header>
        <p class="text-sm font-semibold text-primary">404</p>
        <h1 class="mt-2 text-3xl font-bold text-default">Page not found</h1>
        <p class="mt-3 text-muted">
          The page you requested does not exist or may have moved.
        </p>
      </template>

      <div class="flex justify-center">
        <UButton
          :to="dashboardRoute"
          :label="actionLabel"
          icon="i-lucide-arrow-left"
          size="lg"
        />
      </div>
    </UPageCard>
  </main>
</template>
