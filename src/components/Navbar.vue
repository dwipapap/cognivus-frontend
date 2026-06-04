<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenuOnOutsideClick = (event) => {
  const mobileMenu = document.getElementById('navbar-default')
  if (
    isMobileMenuOpen.value &&
    mobileMenu &&
    !mobileMenu.contains(event.target) &&
    !event.target.closest('[aria-label="Toggle menu"]')
  ) {
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeMobileMenuOnOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMobileMenuOnOutsideClick)
})
</script>

<template>
  <header class="header-glass backdrop-blur-lg bg-gradient-to-r from-surface via-blue-50 to-indigo-100 shadow-card-rest border-b border-white/20 sticky top-0 z-20">
    <div class="flex items-center justify-between px-6 py-4 min-w-0">
      <div class="flex items-center gap-4">
        <router-link to="/" class="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="/src/assets/ittrlogo.png" alt="ITTR" class="h-10 w-auto object-contain" />
        </router-link>

        <div class="hidden md:flex items-center space-x-4">
          <router-link to="/" class="text-ink hover:text-brand-primary px-3 py-2 rounded-token-md text-sm font-medium transition-colors duration-token-default">Home</router-link>
          <a href="#" class="text-ink hover:text-brand-primary px-3 py-2 rounded-token-md text-sm font-medium transition-colors duration-token-default">Article</a>
          <a href="#" class="text-ink hover:text-brand-primary px-3 py-2 rounded-token-md text-sm font-medium transition-colors duration-token-default">Programs</a>
          <a href="#" class="text-ink hover:text-brand-primary px-3 py-2 rounded-token-md text-sm font-medium transition-colors duration-token-default">Testimonials</a>
          <a href="#" class="text-ink hover:text-brand-primary px-3 py-2 rounded-token-md text-sm font-medium transition-colors duration-token-default">About Us</a>
        </div>
      </div>

      <div class="ml-auto flex items-center gap-1 xs:gap-2 sm:gap-3 md:gap-4 flex-nowrap min-w-0">
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          square
          aria-label="Toggle menu"
          class="md:hidden"
          @click="toggleMobileMenu"
        />

        <router-link to="/login"
                    class="flex items-center gap-2 h-10 sm:h-12 px-3 sm:px-4 rounded-token-full sm:rounded-4xl bg-white/30 backdrop-blur-sm border border-white/50 shadow-input-rest hover:bg-white/40 transition-all duration-token-default text-ink hover:text-brand-primary font-medium text-sm whitespace-nowrap">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L12.586 9H5a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"></path>
          </svg>
          <span>Login</span>
        </router-link>
      </div>
    </div>

    <Transition name="mobile-nav">
      <div v-if="isMobileMenuOpen" id="navbar-default" class="md:hidden">
        <div class="px-4 pb-4 space-y-1 bg-white/40 backdrop-blur-sm border-t border-white/20 mt-2">
          <router-link to="/" @click="isMobileMenuOpen = false" class="block py-3 px-3 text-ink hover:text-brand-primary hover:bg-white/30 rounded-token-md transition-colors duration-token-default">Home</router-link>
          <a href="#" @click="isMobileMenuOpen = false" class="block py-3 px-3 text-ink hover:text-brand-primary hover:bg-white/30 rounded-token-md transition-colors duration-token-default">Article</a>
          <a href="#" @click="isMobileMenuOpen = false" class="block py-3 px-3 text-ink hover:text-brand-primary hover:bg-white/30 rounded-token-md transition-colors duration-token-default">Programs</a>
          <a href="#" @click="isMobileMenuOpen = false" class="block py-3 px-3 text-ink hover:text-brand-primary hover:bg-white/30 rounded-token-md transition-colors duration-token-default">Testimonials</a>
          <a href="#" @click="isMobileMenuOpen = false" class="block py-3 px-3 text-ink hover:text-brand-primary hover:bg-white/30 rounded-token-md transition-colors duration-token-default">About Us</a>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.header-glass {
  background: linear-gradient(135deg, #ffffffe6, #dbebffcc, rgba(199, 210, 254, 0.7));
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border-radius: 0 0 30px 30px;
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  will-change: transform;
  transform: translateZ(0);
  contain: layout style paint;
}

.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
  max-height: 0;
}
.mobile-nav-enter-to,
.mobile-nav-leave-from {
  opacity: 1;
  max-height: 400px;
}

@media (prefers-reduced-motion: reduce) {
  .header-glass {
    backdrop-filter: blur(2px) !important;
    -webkit-backdrop-filter: blur(2px) !important;
    transition: none !important;
  }
  .mobile-nav-enter-active,
  .mobile-nav-leave-active {
    transition: none !important;
  }
}
</style>
