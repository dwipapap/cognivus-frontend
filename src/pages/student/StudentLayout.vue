<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../../store/auth';
import { useStudentProfile } from '../../composables/useStudentProfile';

const router = useRouter();
const { studentProfile, isLoading: isProfileLoading } = useStudentProfile();

// Click-based dropdown state
const showDropdown = ref(false);
const isDropdownVisible = ref(false); // Controls actual visibility for animations
const dropdownPosition = ref({ top: '0px', left: '0px' });

// Toggle dropdown on click
const toggleDropdown = () => {
  if (!showDropdown.value) {
    // Calculate position before opening
    const profileButton = document.getElementById('profile-button');
    if (profileButton) {
      const rect = profileButton.getBoundingClientRect();
      dropdownPosition.value = {
        top: `${rect.bottom + 8}px`,
        left: `${rect.right - 224}px` // 224px = w-56 (14rem * 16px)
      };
    }
    
    // Opening the dropdown
    showDropdown.value = true;
    setTimeout(() => {
      isDropdownVisible.value = true;
    }, 10); // Tiny delay to ensure DOM is ready
  } else {
    // Closing the dropdown
    isDropdownVisible.value = false;
    setTimeout(() => {
      showDropdown.value = false;
    }, 300); // Match animation duration
  }
};

// Close dropdown when clicking outside
const closeDropdownOnOutsideClick = (event) => {
  const profileDropdown = document.getElementById('profile-dropdown');
  const profileButton = document.getElementById('profile-button');
  if (
    showDropdown.value && 
    profileDropdown && 
    profileButton && 
    !profileDropdown.contains(event.target) && 
    !profileButton.contains(event.target)
  ) {
    toggleDropdown();
  }
};

// Setup click outside listener
onMounted(() => {
  document.addEventListener('click', closeDropdownOnOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdownOnOutsideClick);
});

const displayName = computed(() => {
  return studentProfile.value?.nama_lengkap || studentProfile.value?.fullname || authStore.user?.username || authStore.user?.email?.split('@')[0] || 'Student';
});

const handleImageError = (event) => {
  event.target.src = 'https://media1.tenor.com/m/JyHMlpMxRKwAAAAC/arisbm.gif';
};

const handleLogout = async () => {
  authStore.clearAuth();
  router.push('/login');
};

onUnmounted(() => {
  console.log('Unmounting StudentLayout.vue');
});
</script>

<template>
  <div class="flex flex-col min-h-screen bg-white">
    <!-- Header -->
    <header class="header-glass backdrop-blur-lg bg-gradient-to-r from-white via-blue-50 to-indigo-100 shadow-lg border-b border-white/20 sticky top-0 z-40">
      <div class="flex items-center justify-between px-6 py-4 min-w-0">
        <!-- Left: ITTR Logo -->
        <div class="flex items-center">
          <img src="/src/assets/ittrlogo.png" alt="ITTR Logo" class="h-10 w-auto object-contain" />
        </div>

        <!-- Right: User Profile -->
        <div class="ml-auto flex items-center gap-1 xs:gap-2 sm:gap-3 md:gap-4 flex-nowrap min-w-0">
          <!-- User Profile Section -->
          <div class="relative z-50">
            <!-- Profile Pill -->
            <div 
              id="profile-button"
              @click.stop="toggleDropdown()"
              class="flex items-center gap-2 sm:gap-3 h-10 sm:h-12 px-2 xs:px-3 sm:px-4 rounded-full sm:rounded-[28px] bg-white/30 backdrop-blur-sm border border-white/50 shadow-sm overflow-hidden whitespace-nowrap max-w-[50vw] xs:max-w-[60vw] sm:max-w-[200px] md:max-w-[240px] min-w-0 hover:bg-white/40 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-white/50">
                <!-- Skeleton while avatar loading -->
                <div v-if="isProfileLoading" class="avatar-skeleton bg-blue-100 w-full h-full rounded-full"></div>

                <!-- Avatar image -->
                <img v-else :src="authStore.user?.user_metadata?.avatar_url || 'https://media1.tenor.com/m/JyHMlpMxRKwAAAAC/arisbm.gif'"
                  :alt="displayName" class="w-full h-full object-cover rounded-full" @error="handleAvatarError" />
              </div>
              <div class="text-left min-w-0 flex-1">
                <p class="text-xs font-semibold text-gray-600 hidden sm:block">Student</p>
                <h3 class="text-base sm:text-lg font-medium text-gray-800 truncate">{{ displayName }}</h3>
              </div>
              <!-- Dropdown arrow indicator -->
              <svg class="w-4 h-4 text-gray-600 transition-transform duration-300" :class="{ 'rotate-180': isDropdownVisible }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>

            <!-- Dropdown Menu with animation classes -->
            <Teleport to="body">
              <div 
                v-if="showDropdown" 
                id="profile-dropdown"
                class="fixed w-56 origin-top-right profile-dropdown-glass rounded-xl shadow-lg border border-white/20 overflow-hidden z-[9999]"
                :class="{'dropdown-enter': isDropdownVisible, 'dropdown-leave': !isDropdownVisible}"
                :style="dropdownPosition"
              >
              <!-- Dropdown Header -->
              <div class="px-4 py-3 border-b border-white/20">
                <h3 class="text-sm font-medium text-gray-800">{{ displayName }}</h3>
                <p class="text-xs text-gray-500 mt-0.5">Student</p>
              </div>

              <!-- Dropdown Items -->
              <div class="py-1">
                <router-link to="/student/profile-view" class="profile-dropdown-item">
                  <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                  </svg>
                  View Profile
                </router-link>
                <a @click="handleLogout" class="profile-dropdown-item hover:text-red-600">
                  <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"></path>
                  </svg>
                  Logout
                </a>
              </div>
              </div>
            </Teleport>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-1 relative sidebar-container">
      <!-- Desktop Sidebar -->
      <aside class="sidebar group w-19 hover:w-64 flex-shrink-0 sidebar-glass shadow-2xl transition-all duration-300 ease-in-out overflow-hidden fixed left-4 top-28 bottom-4 rounded-[28px] z-10 border border-white/20 hidden md:block">
        <!-- Navigation Menu -->
        <nav class="p-4 h-full overflow-y-auto">
          <p class="sidebar-text text-xs font-semibold text-white/80 uppercase tracking-wider mb-3 opacity-0 whitespace-nowrap overflow-hidden">
            Menu
          </p>
          <ul class="space-y-2">
            <li>
              <router-link to="/student/dashboard"
                class="nav-item flex items-center px-3 py-2 text-sm font-medium rounded-lg group">
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                </svg>
                <span class="sidebar-text ml-3 opacity-0 whitespace-nowrap overflow-hidden">Dashboard</span>
              </router-link>
            </li>
            <li>
              <router-link to="/student/courses"
                class="nav-item flex items-center px-3 py-2 text-sm font-medium rounded-lg group">
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                </svg>
                <span class="sidebar-text ml-3 opacity-0 whitespace-nowrap overflow-hidden">My Courses</span>
              </router-link>
            </li>
            <li>
              <router-link to="/student/payment"
                class="nav-item flex items-center px-3 py-2 text-sm font-medium rounded-lg group">
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                  <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                </svg>
                <span class="sidebar-text ml-3 opacity-0 whitespace-nowrap overflow-hidden">Payment</span>
              </router-link>
            </li>
            <li>
              <a @click="handleLogout"
                class="nav-item flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:text-red-400 cursor-pointer group">
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"></path>
                </svg>
                <span class="sidebar-text ml-3 opacity-0 whitespace-nowrap overflow-hidden">Logout</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Mobile Bottom Navigation -->
      <nav class="mobile-nav fixed bottom-0 left-0 right-0 h-16 bg-transparent md:hidden z-50">
        <div class="mobile-nav-glass h-full mb-0 rounded-2xl">
          <ul class="h-full flex justify-around items-center px-6">
            <li>
              <router-link to="/student/dashboard" class="mobile-nav-item flex flex-col items-center gap-1">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                </svg>
                <span class="text-xs">Dashboard</span>
              </router-link>
            </li>
            <li>
              <router-link to="/student/courses" class="mobile-nav-item flex flex-col items-center gap-1">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                </svg>
                <span class="text-xs">Courses</span>
              </router-link>
            </li>
            <li>
              <router-link to="/student/payment" class="mobile-nav-item flex flex-col items-center gap-1">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                  <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-xs">Bayar</span>
              </router-link>
            </li>
            <li>
              <a @click="handleLogout" class="mobile-nav-item flex flex-col items-center gap-1">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-xs">Logout</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="main-content flex-1 p-6 lg:p-8 overflow-auto md:ml-24 mb-20 md:mb-0 transition-all duration-300 ease-in-out">
        <router-view />
      </main>
    </div>
  </div>
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
}

/* Profile dropdown glassmorphism effect - Performance optimized */
.profile-dropdown-glass {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(240, 249, 255, 0.8), rgba(224, 242, 254, 0.75));
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: 
    0 12px 24px rgba(31, 41, 55, 0.08),
    0 4px 16px rgba(59, 130, 246, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  /* Performance optimizations */
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* Dropdown animations */
.dropdown-enter {
  animation: dropdown-appear 300ms ease-out forwards;
}

.dropdown-leave {
  animation: dropdown-disappear 300ms ease-in forwards;
}

@keyframes dropdown-appear {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dropdown-disappear {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
}

.profile-dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  transition: all 200ms ease;
  cursor: pointer;
}

.profile-dropdown-item:hover {
  color: #2563eb;
  background-color: rgba(255, 255, 255, 0.3);
}

.profile-dropdown-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.08);
  backdrop-filter: blur(2px);
}

/* Sidebar glassmorphism effect - Performance optimized */
.sidebar-glass {
  background: linear-gradient(135deg, rgba(43, 127, 255, 0.95), rgba(43, 127, 255, 0.90), rgba(43, 127, 255, 0.85));
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 
    0 12px 24px rgba(31, 41, 55, 0.15),
    0 4px 16px rgba(43, 127, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  /* Performance optimizations */
  will-change: transform;
  transform: translateZ(0);
}

/* Sidebar container for hover detection */
.sidebar-container {
  position: relative;
}

/* Sidebar hover animations */
.sidebar {
  transition: width 300ms ease-in-out, transform 200ms ease, box-shadow 300ms ease;
}

.sidebar:hover {
  width: 16rem;
  transform: translateY(-2px);
  box-shadow: 
    0 35px 60px rgba(31, 41, 55, 0.15),
    0 12px 40px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

/* Push content when sidebar expands */
.sidebar-container:has(.sidebar:hover) .main-content {
  margin-left: 17.5rem;
}

/* Avatar animations and skeleton */
.avatar-container {
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.sidebar:hover .avatar-container {
  transform: scale(1.12);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}

.avatar-skeleton {
  animation: pulse 1.2s infinite ease-in-out;
}

.avatar-img {
  transition: opacity 200ms ease;
}



@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }

  100% {
    opacity: 1;
  }
}

.sidebar:hover .sidebar-text {
  opacity: 1;
  transition: opacity 300ms ease-in-out 150ms;
  /* Delay text appearance */
}

.sidebar-text {
  transition: opacity 300ms ease-in-out;
}

/* Ensure icons stay in place */
.nav-item svg {
  min-width: 1.25rem;
  /* w-5 */
}

/* Smooth hover effects for nav items */
.nav-item {
  transition: all 200ms ease-in-out;
  color: rgba(255, 255, 255, 0.9);
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(2px);
  transform: translateX(4px);
  box-shadow: 0 2px 6px rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.nav-item.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-weight: 600;
}

/* Optional: Add a subtle indicator when sidebar is expandable */
.sidebar::after {
  content: '';
  position: absolute;
  right: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 30px;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.3), rgba(147, 197, 253, 0.3));
  border-radius: 0 4px 4px 0;
  opacity: 0;
  transition: opacity 200ms ease-in-out;
}

.sidebar:hover::after {
  opacity: 1;
}

/* Mobile navigation styles - Performance optimized */
.mobile-nav-glass {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(240, 249, 255, 0.8), rgba(224, 242, 254, 0.75));
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: 
    0 -4px 16px rgba(31, 41, 55, 0.08),
    0 -2px 8px rgba(59, 130, 246, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.mobile-nav-item {
  color: #374151; /* text-gray-700 */
  transition: color 0.2s ease;
  position: relative;
}

.mobile-nav-item.router-link-active {
  color: #2563eb; /* text-blue-600 */
}

.mobile-nav-item:hover {
  color: #2563eb; /* text-blue-600 */
}

.mobile-nav-item::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: currentColor;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.mobile-nav-item.router-link-active::after {
  opacity: 1;
}

/* Additional performance optimizations for glassmorphism */
@media (prefers-reduced-motion: reduce) {
  .header-glass,
  .profile-dropdown-glass,
  .sidebar-glass,
  .mobile-nav-glass {
    backdrop-filter: blur(2px) !important;
    -webkit-backdrop-filter: blur(2px) !important;
    transition: none !important;
  }
  
  .nav-item:hover,
  .profile-dropdown-item:hover {
    transform: none !important;
  }
}

/* GPU acceleration for better performance */
.header-glass,
.profile-dropdown-glass,
.sidebar-glass,
.mobile-nav-glass {
  contain: layout style paint;
}
</style>
