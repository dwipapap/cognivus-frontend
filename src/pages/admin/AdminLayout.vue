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
  { label: 'Popup', icon: 'i-lucide-image', to: '/admin/popup' },
];

const showLogoutConfirm = ref(false);

const handleLogout = () => {
  showLogoutConfirm.value = true;
};

const confirmLogout = () => {
  showLogoutConfirm.value = false;
  authStore.clearAuth();
  router.push('/login');
};
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible resizable>
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
      <template #header>
        <UDashboardNavbar title="Admin">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
      </template>
      <template #body>
        <router-view />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>

  <UModal v-model:open="showLogoutConfirm" title="Sign out" description="Are you sure you want to sign out? You'll need to log in again to access the admin panel." :ui="{ footer: 'justify-end' }">
    <template #footer="{ close }">
      <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
      <UButton label="Sign out" color="error" @click="confirmLogout" />
    </template>
  </UModal>
</template>