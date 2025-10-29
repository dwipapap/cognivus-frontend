<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../../store/auth';

const router = useRouter();

// Click-based dropdown state
const showDropdown = ref(false);
const isDropdownVisible = ref(false);
const dropdownPosition = ref({ top: '0px', left: '0px' });

// Toggle dropdown on click
const toggleDropdown = () => {
  if (!showDropdown.value) {
    const profileButton = document.getElementById('profile-button');
    if (profileButton) {
      const rect = profileButton.getBoundingClientRect();
      dropdownPosition.value = {
        top: `${rect.bottom + 8}px`,
        left: `${rect.right - 224}px`
      };
    }
    
    showDropdown.value = true;
    setTimeout(() => {
      isDropdownVisible.value = true;
    }, 10);
  } else {
    isDropdownVisible.value = false;
    setTimeout(() => {
      showDropdown.value = false;
    }, 300);
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

onMounted(() => {
  document.addEventListener('click', closeDropdownOnOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdownOnOutsideClick);
});

const displayName = computed(() => {
  return authStore.user?.email?.split('@')[0] || 'Admin';
});

const handleAvatarError = (event) => {
  event.target.src = '/src/assets/kucingterbang.png';
};

const handleLogout = async () => {
  authStore.clearAuth();
  router.push('/login');
};
</script>

<template>
  <div class="flex flex-col min-h-screen bg-blue-200">
    <!-- Header -->
    <header class="header-glass backdrop-blur-lg bg-gradient-to-r from-white via-blue-50 to-indigo-100 shadow-lg border-b border-white/20 sticky top-0 z-40">
      <div class="flex items-center justify-between px-6 py-4 min-w-0">
        <!-- Left: ITTR Logo -->
        <div class="flex items-center">
          <img src="/src/assets/ittrlogo.png" alt="ITTR Logo" class="h-10 w-auto object-contain" />
          <span class="ml-4 text-lg font-semibold text-gray-800 hidden sm:inline">Admin Panel</span>
        </div>

        <!-- Right: Notifications and User Profile -->
        <div class="ml-auto flex items-center gap-1 xs:gap-2 sm:gap-3 md:gap-4 flex-nowrap min-w-0">
          <!-- Notification Bell -->
          <button class="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-sm border border-white/50 hover:bg-white/40 transition-all duration-200 shadow-sm shrink-0">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
            </svg>
          </button>

          <!-- User Profile Section -->
          <div class="relative z-50">
            <!-- Profile Pill -->
            <div 
              id="profile-button"
              @click.stop="toggleDropdown()"
              class="flex items-center gap-2 sm:gap-3 h-10 sm:h-12 px-2 xs:px-3 sm:px-4 rounded-full bg-white/30 backdrop-blur-sm border border-white/50 shadow-sm overflow-hidden whitespace-nowrap max-w-[50vw] xs:max-w-[60vw] sm:max-w-[200px] md:max-w-[240px] min-w-0 hover:bg-white/40 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-white/50">
                <img :src="authStore.user?.user_metadata?.avatar_url || '/src/assets/kucingterbang.png'"
                  :alt="displayName" class="w-full h-full object-cover rounded-full" @error="handleAvatarError" />
              </div>
              <div class="text-left min-w-0 flex-1">
                <p class="text-xs font-semibold text-gray-600 hidden sm:block">Admin</p>
                <h3 class="text-base sm:text-lg font-medium text-gray-800 truncate">{{ displayName }}</h3>
              </div>
              <svg class="w-4 h-4 text-gray-600 transition-transform duration-300" :class="{ 'rotate-180': isDropdownVisible }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>

            <!-- Dropdown Menu -->
            <Teleport to="body">
              <div 
                v-if="showDropdown" 
                id="profile-dropdown"
                class="fixed w-56 origin-top-right profile-dropdown-glass rounded-xl shadow-lg border border-white/20 overflow-hidden z-[9999]"
                :class="{'dropdown-enter': isDropdownVisible, 'dropdown-leave': !isDropdownVisible}"
                :style="dropdownPosition"
              >
                <div class="px-4 py-3 border-b border-white/20">
                  <h3 class="text-sm font-medium text-gray-800">{{ displayName }}</h3>
                  <p class="text-xs text-gray-500 mt-0.5">Admin</p>
                </div>

                <div class="py-1">
                  <router-link to="/admin/dashboard" class="profile-dropdown-item">
                    <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                    </svg>
                    Dashboard
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

    <div class="flex flex-1 relative">
      <!-- Desktop Sidebar - Always visible, no hover collapse, no rounded corners -->
      <aside class="sidebar w-64 flex-shrink-0 sidebar-glass shadow-2xl overflow-hidden fixed left-0 top-20 bottom-0 z-10 hidden md:block">
        <!-- Navigation Menu -->
        <nav class="p-4 h-full overflow-y-auto">
          <p class="text-xs font-semibold text-white/80 uppercase tracking-wider mb-3">
            Menu
          </p>
          <ul class="space-y-2">
            <li>
              <router-link to="/admin/dashboard"
                class="nav-item flex items-center px-3 py-2 text-sm font-medium rounded-lg">
                <svg class="w-5 h-5 flex-shrink-0 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                </svg>
                <span>Dashboard</span>
              </router-link>
            </li>
            <li>
              <router-link to="/admin/lecturers"
                class="nav-item flex items-center px-3 py-2 text-sm font-medium rounded-lg">
                <svg class="w-5 h-5 flex-shrink-0 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                </svg>
                <span>Manage Lecturers</span>
              </router-link>
            </li>
            <li>
              <router-link to="/admin/classes"
                class="nav-item flex items-center px-3 py-2 text-sm font-medium rounded-lg">
                <svg class="w-5 h-5 flex-shrink-0 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                </svg>
                <span>Manage Classes</span>
              </router-link>
            </li>
            <li>
              <router-link to="/admin/prices"
                class="nav-item flex items-center px-3 py-2 text-sm font-medium rounded-lg">
                <svg class="w-5 h-5 flex-shrink-0 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
                </svg>
                <span>Classes Price</span>
              </router-link>
            </li>
            <li>
              <router-link to="/admin/students"
                class="nav-item flex items-center px-3 py-2 text-sm font-medium rounded-lg">
                <svg class="w-5 h-5 flex-shrink-0 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                </svg>
                <span>Manage Students</span>
              </router-link>
            </li>
            <li>
              <router-link to="/admin/programs"
                class="nav-item flex items-center px-3 py-2 text-sm font-medium rounded-lg">
                <svg class="w-5 h-5 flex-shrink-0 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                </svg>
                <span>Manage Programs</span>
              </router-link>
            </li>
            <li>
              <router-link to="/admin/levels"
                class="nav-item flex items-center px-3 py-2 text-sm font-medium rounded-lg">
                <svg class="w-5 h-5 flex-shrink-0 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span>Manage Levels</span>
              </router-link>
            </li>
            <li>
              <router-link to="/admin/teacher-levels"
                class="nav-item flex items-center px-3 py-2 text-sm font-medium rounded-lg">
                <svg class="w-5 h-5 flex-shrink-0 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                </svg>
                <span>Teacher Levels</span>
              </router-link>
            </li>
            <li class="pt-4 mt-4 border-t border-white/20">
              <a @click="handleLogout"
                class="nav-item flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:text-red-400 cursor-pointer">
                <svg class="w-5 h-5 flex-shrink-0 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"></path>
                </svg>
                <span>Logout</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Mobile Bottom Navigation -->
      <nav class="mobile-nav fixed bottom-0 left-0 right-0 h-16 bg-transparent md:hidden z-50">
        <div class="mobile-nav-glass h-full mb-0 rounded-3xl">
          <ul class="h-full flex justify-around items-center px-2">
            <li>
              <router-link to="/admin/dashboard" class="mobile-nav-item flex flex-col items-center gap-1">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                </svg>
                <span class="text-[10px]">Home</span>
              </router-link>
            </li>
            <li>
              <router-link to="/admin/students" class="mobile-nav-item flex flex-col items-center gap-1">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                </svg>
                <span class="text-[10px]">Students</span>
              </router-link>
            </li>
            <li>
              <router-link to="/admin/lecturers" class="mobile-nav-item flex flex-col items-center gap-1">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                </svg>
                <span class="text-[10px]">Staff</span>
              </router-link>
            </li>
            <li>
              <router-link to="/admin/classes" class="mobile-nav-item flex flex-col items-center gap-1">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"></path>
                </svg>
                <span class="text-[10px]">Classes</span>
              </router-link>
            </li>
            <li>
              <router-link to="/admin/prices" class="mobile-nav-item flex flex-col items-center gap-1">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582z"></path>
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-[10px]">Price</span>
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="flex-1 p-6 lg:p-8 overflow-auto md:ml-64 mb-20 md:mb-0">
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
  will-change: transform;
  transform: translateZ(0);
}

/* Profile dropdown glassmorphism effect */
.profile-dropdown-glass {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(240, 249, 255, 0.8), rgba(224, 242, 254, 0.75));
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: 
    0 12px 24px rgba(31, 41, 55, 0.08),
    0 4px 16px rgba(59, 130, 246, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
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
  transform: translateX(4px);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.08);
  backdrop-filter: blur(2px);
}

/* Sidebar glassmorphism effect - Always visible (no hover collapse), no rounded corners */
.sidebar-glass {
  background: linear-gradient(135deg, rgba(43, 127, 255, 0.95), rgba(43, 127, 255, 0.90), rgba(43, 127, 255, 0.85));
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 
    0 12px 24px rgba(31, 41, 55, 0.15),
    0 4px 16px rgba(43, 127, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  will-change: transform;
  transform: translateZ(0);
}

/* Nav item styles */
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

/* Mobile navigation styles */
.mobile-nav-glass {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(240, 249, 255, 0.8), rgba(224, 242, 254, 0.75));
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: 
    0 -4px 16px rgba(31, 41, 55, 0.08),
    0 -2px 8px rgba(59, 130, 246, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  will-change: transform;
  transform: translateZ(0);
}

.mobile-nav-item {
  color: #374151;
  transition: color 0.2s ease;
  position: relative;
}

.mobile-nav-item.router-link-active {
  color: #2563eb;
}

.mobile-nav-item:hover {
  color: #2563eb;
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

/* Performance optimizations for reduced motion */
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