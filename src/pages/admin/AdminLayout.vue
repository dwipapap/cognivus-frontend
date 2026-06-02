<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../../store/auth';

const router = useRouter();

const navItems = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/admin/dashboard' },
  { label: 'Students', icon: 'i-lucide-users', to: '/admin/students' },
  { label: 'Lecturers', icon: 'i-lucide-user-check', to: '/admin/lecturers' },
  { label: 'Classes', icon: 'i-lucide-graduation-cap', to: '/admin/classes' },
  { label: 'Payments', icon: 'i-lucide-wallet', to: '/admin/payments' },
  { label: 'Prices', icon: 'i-lucide-tag', to: '/admin/prices' },
  { label: 'Programs', icon: 'i-lucide-folder-tree', to: '/admin/programs' },
  { label: 'Levels', icon: 'i-lucide-bar-chart-3', to: '/admin/levels' },
  { label: 'External Links', icon: 'i-lucide-external-link', to: '/admin/external-links' },
];

const handleLogout = () => {
  authStore.clearAuth();
  router.push('/login');
};
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible resizable>
      <template #header="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" />
      </template>
      <template #default="{ collapsed }">
        <UNavigationMenu :collapsed="collapsed" :items="navItems" orientation="vertical" />
      </template>
      <template #footer="{ collapsed }">
        <UButton
          :icon="collapsed ? 'i-lucide-log-out' : undefined"
          :label="collapsed ? undefined : 'Sign out'"
          color="neutral"
          variant="ghost"
          block
          @click="handleLogout"
        />
      </template>
    </UDashboardSidebar>
    <UDashboardPanel>
      <template #body>
        <router-view />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
