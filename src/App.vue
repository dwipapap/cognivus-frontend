<script setup>
import Navbar from './components/Navbar.vue';

const noNavbarRoutes = ['Login', 'StudentDashboard', 'StudentProfile', 'StudentProfileView', 'LecturerDashboard', 'LecturerProfileView'];
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