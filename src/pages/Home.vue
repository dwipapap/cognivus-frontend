<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Hero from './Hero.vue';
import TujuanCard from '../components/TujuanCard.vue';

// Mobile menu state
const isMobileMenuOpen = ref(false);

// Toggle mobile menu
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// Close mobile menu when clicking outside
const closeMobileMenuOnOutsideClick = (event) => {
  const mobileMenu = document.getElementById('navbar-default');
  const menuButton = document.querySelector('[data-collapse-toggle="navbar-default"]');
  
  if (
    isMobileMenuOpen.value && 
    mobileMenu && 
    menuButton && 
    !mobileMenu.contains(event.target) && 
    !menuButton.contains(event.target)
  ) {
    isMobileMenuOpen.value = false;
  }
};

// Setup click outside listener
onMounted(() => {
  document.addEventListener('click', closeMobileMenuOnOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', closeMobileMenuOnOutsideClick);
});
</script>

<template>
  <!-- Navbar - Only shown on Home page -->
  <header class="header-glass backdrop-blur-lg bg-gradient-to-r from-white via-blue-50 to-indigo-100 shadow-lg border-b border-white/20 sticky top-0 z-20">
    <div class="flex items-center justify-between px-6 py-4 min-w-0">
      <!-- Left: Logo + Desktop Links -->
      <div class="flex items-center gap-4">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="/src/assets/ittrlogo.png" alt="ITTR" class="h-10 w-auto object-contain" />
        </router-link>

        <!-- Desktop Links -->
        <div class="hidden md:flex items-center space-x-4">
          <router-link to="/" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</router-link>
          <a href="#" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Article</a>
          <a href="#" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Programs</a>
          <a href="#" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Testimonials</a>
          <a href="#" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">About Us</a>
        </div>
      </div>

      <!-- Right: Mobile menu button + Login -->
      <div class="ml-auto flex items-center gap-1 xs:gap-2 sm:gap-3 md:gap-4 flex-nowrap min-w-0">
        <!-- Mobile menu button -->
        <button @click="toggleMobileMenu" type="button" 
                class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200" 
                aria-controls="navbar-default" :aria-expanded="isMobileMenuOpen">
          <span class="sr-only">Open main menu</span>
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
          </svg>
        </button>

        <!-- Login Button -->
        <router-link to="/login" 
                    class="flex items-center gap-2 h-10 sm:h-12 px-3 sm:px-4 rounded-full sm:rounded-4xl bg-white/30 backdrop-blur-sm border border-white/50 shadow-sm hover:bg-white/40 transition-all duration-200 text-gray-700 hover:text-blue-600 font-medium text-sm whitespace-nowrap">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L12.586 9H5a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"></path>
          </svg>
          <span>Masuk</span>
        </router-link>
      </div>
    </div>

    <!-- Mobile Collapsible Menu -->
    <div v-show="isMobileMenuOpen" id="navbar-default" class="md:hidden">
      <div class="px-4 pb-4 space-y-2 bg-white/40 backdrop-blur-sm border-t border-white/20 mt-2">
        <router-link to="/" @click="isMobileMenuOpen = false" class="block py-2 px-3 text-gray-700 hover:text-blue-600 hover:bg-white/30 rounded-md transition-colors">Home</router-link>
        <a href="#" @click="isMobileMenuOpen = false" class="block py-2 px-3 text-gray-700 hover:text-blue-600 hover:bg-white/30 rounded-md transition-colors">Article</a>
        <a href="#" @click="isMobileMenuOpen = false" class="block py-2 px-3 text-gray-700 hover:text-blue-600 hover:bg-white/30 rounded-md transition-colors">Programs</a>
        <a href="#" @click="isMobileMenuOpen = false" class="block py-2 px-3 text-gray-700 hover:text-blue-600 hover:bg-white/30 rounded-md transition-colors">Testimonials</a>
        <a href="#" @click="isMobileMenuOpen = false" class="block py-2 px-3 text-gray-700 hover:text-blue-600 hover:bg-white/30 rounded-md transition-colors">About Us</a>
      </div>
    </div>
  </header>

  <!-- Page Content -->
  <Hero />
  <TujuanCard />
</template>

<style scoped>
/* Header glassmorphism effect - Performance optimized */
.header-glass {
  background: linear-gradient(135deg, #ffffffe6, #dbebffcc, rgba(199, 210, 254, 0.7));
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border-radius: 0 0 30px 30px;
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* Performance optimizations */
  will-change: transform;
  transform: translateZ(0);
  contain: layout style paint;
}

/* Performance optimizations for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .header-glass {
    backdrop-filter: blur(2px) !important;
    -webkit-backdrop-filter: blur(2px) !important;
    transition: none !important;
  }
}
</style>