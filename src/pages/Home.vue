<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Hero images
import heroStudentImg from '../assets/images/home/hero_student.png';
import heroProfessionalImg from '../assets/images/home/hero_professional.png';
import heroTeacherImg from '../assets/images/home/hero_teacher.png';

// Hero images for bento grid
const heroImages = ref({
  student: heroStudentImg,
  professional: heroProfessionalImg,
  teacher: heroTeacherImg
});

// Mobile menu state
const isMobileMenuOpen = ref(false);

// User roles/features for the LMS
const userRoles = ref([
  {
    title: 'Students',
    description: 'Access comprehensive courses, track your learning progress, submit assignments, and collaborate with peers in an intuitive learning environment.',
    iconType: 'student',
    features: ['Course Enrollment', 'Progress Tracking', 'Assignment Submission', 'Payment Integration']
  },
  {
    title: 'Lecturers',
    description: 'Create engaging courses, manage classes efficiently, grade assignments with ease, and monitor student performance with powerful analytics tools.',
    iconType: 'lecturer',
    features: ['Course Creation', 'Class Management', 'Grading System', 'Student Analytics']
  },
  {
    title: 'Administrators',
    description: 'Oversee the entire platform with comprehensive tools to manage users, courses, payments, and generate detailed reports for data-driven decisions.',
    iconType: 'admin',
    features: ['User Management', 'System Configuration', 'Payment Oversight', 'Detailed Reporting']
  }
]);

// LMS Key Features
const lmsFeatures = ref([
  {
    title: 'Integrated Payment',
    description: 'Seamless Midtrans integration for secure course payments',
    iconType: 'payment'
  },
  {
    title: 'Improvement Grading',
    description: 'Simple and easy grading system for assignments',
    iconType: 'grading'
  },
  {
    title: 'Multi-level Access',
    description: 'Role-based permissions for students, lecturers, and admins',
    iconType: 'access'
  },
  {
    title: 'OAuth Support',
    description: 'Quick login with Google using Supabase authentication',
    iconType: 'oauth'
  }
]);

// Program levels
const programLevels = ref([
  {
    title: 'Pre Elementary',
    description: 'Pre-Elementary English class for young learners. Maximum class size: 10 students.',
    iconType: 'preElementary',
    gradient: 'from-blue-500 to-blue-700'
  },
  {
    title: 'Elementary',
    description: 'Elementary English class for beginners. Maximum class size: 10 students.',
    iconType: 'elementary',
    gradient: 'from-blue-600 to-blue-800'
  },
  {
    title: 'Intermediate',
    description: 'Intermediate English class to build fluency. Maximum class size: 10 students.',
    iconType: 'intermediate',
    gradient: 'from-blue-700 to-blue-900'
  },
  {
    title: 'Advanced',
    description: 'Advanced English class for expert learners. Maximum class size: 10 students.',
    iconType: 'advanced',
    gradient: 'from-blue-800 to-blue-950'
  }
]);

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

// Intersection Observer for scroll-triggered animations
let observer = null;

const setupScrollAnimations = () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-visible');
          // Stop observing once animated
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  // Observe all elements with scroll-animate class
  document.querySelectorAll('.scroll-animate').forEach((el) => {
    observer.observe(el);
  });
};

// Setup click outside listener and scroll animations
onMounted(() => {
  document.addEventListener('click', closeMobileMenuOnOutsideClick);
  // Delay to ensure DOM is ready
  setTimeout(setupScrollAnimations, 100);
});

onUnmounted(() => {
  document.removeEventListener('click', closeMobileMenuOnOutsideClick);
  if (observer) {
    observer.disconnect();
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Navbar -->
    <header class="header-glass backdrop-blur-lg sticky top-0 z-50">
      <div class="flex items-center justify-between px-6 lg:px-12 py-4">
        <!-- Left: Logo + Desktop Links -->
        <div class="flex items-center gap-8">
          <!-- Logo -->
          <router-link to="/" class="flex items-center space-x-3">
            <img src="/src/assets/ittrlogo.png" alt="ITTR" class="h-10 w-auto object-contain" />
          </router-link>

          <!-- Desktop Links -->
          <nav class="hidden md:flex items-center space-x-6">
            <a href="#features" class="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features</a>
            <a href="#stats" class="text-gray-700 hover:text-blue-600 font-medium transition-colors">About</a>
            <a href="#" class="text-gray-700 hover:text-blue-600 font-medium transition-colors">Programs</a>
            <a href="#" class="text-gray-700 hover:text-blue-600 font-medium transition-colors">Contact</a>
          </nav>
        </div>

        <!-- Right: Mobile menu button + Login -->
        <div class="flex items-center gap-3">
          <!-- Mobile menu button -->
          <button @click="toggleMobileMenu" type="button"
            class="inline-flex items-center p-2 w-10 h-10 justify-center text-gray-500 rounded-lg md:hidden hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            aria-controls="navbar-default" :aria-expanded="isMobileMenuOpen">
            <span class="sr-only">Open main menu</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Login Button -->
          <router-link to="/login"
            class="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105">
            <span>Login</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </router-link>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-show="isMobileMenuOpen" id="navbar-default" class="md:hidden border-t border-white/20">
        <nav class="px-4 py-4 space-y-2 bg-white/40 backdrop-blur-sm">
          <a href="#features" @click="isMobileMenuOpen = false"
            class="block py-2 px-3 text-gray-700 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all">Features</a>
          <a href="#stats" @click="isMobileMenuOpen = false"
            class="block py-2 px-3 text-gray-700 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all">About</a>
          <a href="#" @click="isMobileMenuOpen = false"
            class="block py-2 px-3 text-gray-700 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all">Programs</a>
          <a href="#" @click="isMobileMenuOpen = false"
            class="block py-2 px-3 text-gray-700 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all">Contact</a>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="max-w-7xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <!-- Left Column: Content -->
        <div class="order-2 lg:order-1">
          <h1
            class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6 text-blue-900 animate-fade-up"
            style="animation-delay: 0.1s">
            The Best English<br />
            <span class="text-blue-600">Learning Solution</span><br />
            for You
          </h1>

          <p class="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg animate-fade-up"
            style="animation-delay: 0.2s">
            An intuitive learning platform to enhance your team's performance exponentially.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row items-start gap-4 animate-fade-up" style="animation-delay: 0.3s">
            <router-link to="/login"
              class="inline-flex items-center justify-center px-8 py-4 rounded-full bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-xl transition-all duration-300">
              Login
            </router-link>
            <a href="#features"
              class="inline-flex items-center justify-center px-8 py-4 rounded-full border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-all duration-300">
              View Features
            </a>
          </div>
        </div>

        <!-- Right Column: Bento Grid -->
        <div class="order-1 lg:order-2 animate-fade-in" style="animation-delay: 0.2s">
          <div class="grid grid-cols-3 grid-rows-4 gap-3 md:gap-4 h-[420px] md:h-[480px]">
            <!-- Stats Card: Learning Activities (Top Left) -->
            <div
              class="col-span-2 row-span-1 bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-white/50 shadow-lg flex flex-col justify-center">
              <span class="text-2xl md:text-3xl font-bold text-blue-600">30,000+</span>
              <span class="text-sm text-gray-600">Learning Materials</span>
            </div>

            <!-- Image Card: Professional (Top Right) - spans 2 rows -->
            <div class="col-span-1 row-span-2 rounded-2xl overflow-hidden shadow-lg">
              <img :src="heroImages.professional" alt="Professional" class="w-full h-full object-cover" />
            </div>

            <!-- Map Card (Second Row Left) -->
            <div
              class="col-span-2 row-span-1 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg relative overflow-hidden flex items-center">
              <div class="absolute inset-0 opacity-10">
                <svg viewBox="0 0 400 200" class="w-full h-full" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path class="text-blue-600"
                    d="M50,100 Q100,50 150,80 T250,70 T350,100 Q300,150 250,120 T150,130 T50,100" />
                </svg>
              </div>
              <div class="relative z-10">
                <p class="text-sm text-gray-600 leading-relaxed">Great Learning Experience<br />for All Ages</p>
              </div>
            </div>

            <!-- Stats Card: Partners (Third Row Left) -->
            <div
              class="col-span-1 row-span-1 bg-white/80 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/50 shadow-lg flex flex-col justify-center">
              <span class="text-xl md:text-2xl font-bold text-blue-600">500+</span>
              <span class="text-xs text-gray-600">Students Enrolled</span>
            </div>

            <!-- Stats Card: Active Users (Third Row Center) -->
            <div
              class="col-span-1 row-span-1 bg-white/80 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/50 shadow-lg flex flex-col justify-center">
              <span class="text-xl md:text-2xl font-bold text-blue-600">4000+</span>
              <span class="text-xs text-gray-600">Graduates</span>
            </div>

            <!-- Image Card: Student (Third Row Right) - spans 2 rows -->
            <div class="col-span-1 row-span-2 rounded-2xl overflow-hidden shadow-lg">
              <img :src="heroImages.student" alt="Student" class="w-full h-full object-cover" />
            </div>

            <!-- Stats Card: Certified Teachers (Bottom Left) -->
            <div
              class="col-span-1 row-span-1 bg-blue-600 rounded-2xl p-3 md:p-4 shadow-lg flex flex-col justify-center">
              <span class="text-xl md:text-2xl font-bold text-white">100+</span>
              <span class="text-xs text-blue-100">Certified Teachers</span>
            </div>

            <!-- Stats Card: Years Experience (Bottom Center) -->
            <div
              class="col-span-1 row-span-1 bg-white/80 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/50 shadow-lg flex flex-col justify-center">
              <span class="text-xl md:text-2xl font-bold text-blue-600">60+</span>
              <span class="text-xs text-gray-600">Years Experience</span>
            </div>
          </div>
        </div>
      </div>

      <!-- LMS Features Section -->
      <div id="stats" class="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="(feature, index) in lmsFeatures" :key="index"
          class="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group scroll-animate"
          :data-delay="index + 1">
          <div class="flex items-start gap-4">
            <div
              class="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
              <!-- Payment Icon -->
              <svg v-if="feature.iconType === 'payment'" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
              </svg>
              <!-- Grading Icon -->
              <svg v-else-if="feature.iconType === 'grading'" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>
              <!-- Access Icon -->
              <svg v-else-if="feature.iconType === 'access'" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              <!-- OAuth Icon -->
              <svg v-else-if="feature.iconType === 'oauth'" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-gray-900 mb-2">{{ feature.title }}</h3>
              <p class="text-sm text-gray-600 leading-relaxed">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- User Roles Section -->
    <section id="features" class="py-20 bg-white/30 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16 scroll-animate">
          <h2 class="text-4xl md:text-5xl font-bold mb-4 text-blue-900">
            Built for Everyone
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Three powerful experiences tailored for your role in education
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="(role, index) in userRoles" :key="index"
            class="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 hover:-translate-y-2 scroll-animate"
            :data-delay="index + 1">
            <!-- Icon -->
            <div
              class="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
              <!-- Student Icon -->
              <svg v-if="role.iconType === 'student'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
              <!-- Lecturer Icon -->
              <svg v-else-if="role.iconType === 'lecturer'" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              <!-- Admin Icon -->
              <svg v-else-if="role.iconType === 'admin'" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>

            <!-- Title -->
            <h3 class="text-2xl font-bold mb-4 text-gray-900">{{ role.title }}</h3>

            <!-- Description -->
            <p class="text-gray-600 mb-6 leading-relaxed">{{ role.description }}</p>

            <!-- Features List -->
            <div class="space-y-3">
              <div v-for="(feature, idx) in role.features" :key="idx"
                class="flex items-center gap-2 text-sm text-gray-700">
                <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ feature }}</span>
              </div>
            </div>

            <!-- Learn More Link -->
            <div class="mt-6 pt-6 border-t border-gray-100">
              <a href="#"
                class="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all duration-300">
                Learn more
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Program Levels Section -->
    <section class="py-20 max-w-7xl mx-auto px-6">
      <div class="text-center mb-16 scroll-animate">
        <h2 class="text-4xl md:text-5xl font-bold mb-4 text-blue-900">
          Choose Your Program Level
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          English learning classes across levels for every learner.
        </p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="(level, index) in programLevels" :key="index"
          class="group relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden scroll-animate"
          :data-delay="index + 1">
          <!-- Gradient Background Overlay -->
          <div
            :class="['absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500', level.gradient]">
          </div>

          <div class="relative z-10">
            <!-- Icon -->
            <div
              :class="['w-20 h-20 bg-gradient-to-br rounded-2xl flex items-center justify-center mb-6 text-white transition-all duration-500 shadow-lg', level.gradient]">
              <!-- Pre Elementary Icon -->
              <svg v-if="level.iconType === 'preElementary'" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
              </svg>
              <!-- Elementary Icon -->
              <svg v-else-if="level.iconType === 'elementary'" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
              <!-- Intermediate Icon -->
              <svg v-else-if="level.iconType === 'intermediate'" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <!-- Advanced Icon -->
              <svg v-else-if="level.iconType === 'advanced'" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
            </div>

            <!-- Title -->
            <h3 class="text-2xl font-bold mb-4 text-gray-900 group-hover:text-white transition-colors duration-500">
              {{ level.title }}
            </h3>

            <!-- Description -->
            <p class="text-gray-600 leading-relaxed group-hover:text-white/90 transition-colors duration-500">
              {{ level.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <h1
      class="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6 text-blue-900 text-center max-w-7xl mx-auto px-6 scroll-animate">
      We Used This<br />
      Website!
    </h1>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto px-6 scroll-animate" data-delay="1">
      <div class="grid gap-4">
        <div>
          <img class="h-auto max-w-full rounded-base"
            src="https://i0.wp.com/moegamer.net/wp-content/uploads/2020/09/ninomae_ina_nis_hololive_and_1_more_drawn_by_umemaro_siona0908__sample-99ef09dfc772dd914f0af158f6fd02a5-6614649.jpg?resize=474%2C448&ssl=1"
            alt="">
        </div>
        <div>
          <img class="h-auto max-w-full rounded-base"
            src="https://media1.tenor.com/m/8WbfUnK_A9sAAAAd/larry-larry-baby.gif" alt="">
        </div>
        <div>
          <img class="h-auto max-w-full rounded-base"
            src="https://media1.tenor.com/m/g0TdYZ1BMpgAAAAC/ishowspeed-meme.gif" alt="">
        </div>
      </div>
      <div class="grid gap-4">
        <div>
          <img class="h-auto max-w-full rounded-base"
            src="https://hips.hearstapps.com/hmg-prod/images/ryan-gosling-attends-the-world-premiere-of-barbie-at-shrine-news-photo-1689099557.jpg?crop=0.669xw:1.00xh;0.290xw,0&resize=640:*"
            alt="">
        </div>
        <div>
          <img class="h-auto max-w-full rounded-base"
            src="https://i.pinimg.com/736x/f2/80/eb/f280eb0cd9c45e32e33571498f75e7b2.jpg" alt="">
        </div>
        <div>
          <img class="h-auto max-w-full rounded-base"
            src="https://awsimages.detik.net.id/community/media/visual/2025/08/10/merah-putih-one-for-all-1754811559068_34.webp?w=700&q=90"
            alt="">
        </div>
      </div>
      <div class="grid gap-4">
        <div>
          <img class="h-auto max-w-full rounded-base"
            src="https://awsimages.detik.net.id/community/media/visual/2022/08/05/ilustrasi-anak-belajar-rumus-luas-dan-keliling-persegi-panjang.jpeg?w=600&q=90"
            alt="">
        </div>
        <div>
          <img class="h-auto max-w-full rounded-base"
            src="https://img.pikbest.com/backgrounds/20250320/-2a-2a-22orange-cat-with-glasses-reading-a-book_11613230.jpg!w700wp"
            alt="">
        </div>
        <div>
          <img class="h-auto max-w-full rounded-base"
            src="https://media.istockphoto.com/id/520129278/id/foto/kucing-lucu-terbang-di-langit.jpg?s=612x612&w=0&k=20&c=_84AabpPN9XPjgYvHS8kXlcgcZdFYcEhi2K4WjrPgmM="
            alt="">
        </div>
      </div>
      <div class="grid gap-4">
        <div>
          <img class="h-auto max-w-full rounded-base"
            src="https://cdn.grid.id/crop/0x0:0x0/700x0/photo/2018/09/08/1404606148.jpg" alt="">
        </div>
        <div>
          <img class="h-auto max-w-full rounded-base"
            src="https://cdn.polyspeak.ai/speakmaster/b7a6679ba72f64e42dfdd797ef11f2a9.webp" alt="">
        </div>
        <div>
          <img class="h-auto max-w-full rounded-base"
            src="https://i.namu.wiki/i/Wh33Jo92CkywkYMQ-J9BMiksh48mo6mOy3QGgyTAedieJh81aeOFlLwrfbRuZaZcGBOwGWD53yfHqcH5sCswig.webp"
            alt="">
        </div>
      </div>
    </div>


    <!-- CTA Section -->
    <section class="py-20 max-w-7xl mx-auto px-6">
      <div
        class="bg-blue-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden scroll-animate">
        <!-- Decorative elements -->
        <div
          class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2">
        </div>
        <div
          class="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2">
        </div>

        <div class="relative z-10">
          <h2 class="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Learning?</h2>
          <p class="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of students and educators already using our platform to achieve their goals.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <router-link to="/login"
              class="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              Get Started Free
            </router-link>
            <button
              class="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Badge -->
    <section class="flex justify-center scroll-animate">
      <div
        class="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-8 border border-white/40 shadow-sm">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span class="text-gray-700 font-medium">Made with Love by Cognivus</span>
      </div>
    </section>



    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-300 py-12">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <img src="/src/assets/ittrlogo.png" alt="ITTR"
              class="h-10 w-auto object-contain mb-4 brightness-0 invert" />
            <p class="text-sm text-gray-400">Modern Learning Management System for the future of education.</p>
          </div>
          <div>
            <h4 class="font-semibold mb-4 text-white">Product</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4 text-white">Company</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4 text-white">Legal</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 ITTR Cognivus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.header-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

/* Entrance Animations */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(40px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-up {
  opacity: 0;
  animation: fadeUp 0.7s ease-out forwards;
}

.animate-fade-in {
  opacity: 0;
  animation: fadeIn 0.8s ease-out forwards;
}

.animate-slide-right {
  opacity: 0;
  animation: slideInRight 0.7s ease-out forwards;
}

/* Scroll-triggered animations */
.scroll-animate {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s ease-out, transform 0.7s ease-out;
}

.scroll-animate.scroll-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered delays for children */
.scroll-animate[data-delay="1"] {
  transition-delay: 0.1s;
}

.scroll-animate[data-delay="2"] {
  transition-delay: 0.2s;
}

.scroll-animate[data-delay="3"] {
  transition-delay: 0.3s;
}

.scroll-animate[data-delay="4"] {
  transition-delay: 0.4s;
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .header-glass {
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .animate-fade-up,
  .animate-fade-in,
  .animate-slide-right {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .scroll-animate {
    opacity: 1;
    transform: none;
    transition: none;
  }

  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>