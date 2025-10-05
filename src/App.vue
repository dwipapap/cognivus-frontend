<script setup>
import { onMounted } from 'vue';
import { authStore } from './store/auth';
import Navbar from './components/Navbar.vue';

const noNavbarRoutes = ['Login', 'StudentDashboard', 'StudentProfile', 'StudentProfileView', 'LecturerDashboard', 'LecturerProfileView'];

// Initialize auth store on app mount
onMounted(async () => {
  console.log('App.vue mounted, initializing auth store');
  await authStore.init();
});
</script>

<template>
  <div>
    <Navbar v-if="!noNavbarRoutes.includes($route.name)" />
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>

</style>