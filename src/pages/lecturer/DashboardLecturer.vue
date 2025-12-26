<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../../store/auth';
import { useLecturerProfile } from '../../composables/useLecturerProfile';
import { classAPI, studentAPI, levelAPI } from '../../services/api';
import LoadingBar from '../../components/ui/LoadingBar.vue';
import IconCheckCircle from '~icons/solar/check-circle-bold';
import IconUsersGroup from '~icons/solar/users-group-rounded-bold';
import IconBook from '~icons/basil/book-solid';
import IconUpload from '~icons/solar/upload-bold';
import IconCalendar from '~icons/solar/calendar-bold';
import IconDocument from '~icons/solar/document-text-bold';
import IconArrowRight from '~icons/basil/arrow-right-solid';
import IconClock from '~icons/basil/clock-solid';
import IconUserGroup from '~icons/solar/users-group-two-rounded-bold';
import IconLightbulb from '~icons/solar/lightbulb-bolt-bold';
import IconChevronLeft from '~icons/solar/alt-arrow-left-linear';
import IconChevronRight from '~icons/solar/alt-arrow-right-linear';

const router = useRouter();

/** Motivational quotes for educators */
const motivationalQuotes = [
  {
    quote: "Teaching is the one profession that creates all other professions.",
    author: "Unknown"
  },
  {
    quote: "The art of teaching is the art of assisting discovery.",
    author: "Mark Van Doren"
  },
  {
    quote: "Education is not the filling of a pail, but the lighting of a fire.",
    author: "W.B. Yeats"
  },
  {
    quote: "A good teacher can inspire hope, ignite the imagination, and instill a love of learning.",
    author: "Brad Henry"
  },
  {
    quote: "The best teachers are those who show you where to look but don't tell you what to see.",
    author: "Alexandra K. Trenfor"
  },
  {
    quote: "Teaching kids to count is fine, but teaching them what counts is best.",
    author: "Bob Talbert"
  },
  {
    quote: "Every student can learn, just not on the same day or in the same way.",
    author: "George Evans"
  }
];

/** Get a daily quote based on date (changes once per day) */
const dailyQuote = computed(() => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % motivationalQuotes.length;
  return motivationalQuotes[index];
});

/** Calendar state */
const currentDate = ref(new Date());

/** Get current month and year for display */
const calendarTitle = computed(() => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`;
});

/** Get days of week header */
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Map day names to day numbers (0 = Sunday, 1 = Monday, etc.) */
const dayNameToNumber = {
  'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
  'Thursday': 4, 'Friday': 5, 'Saturday': 6
};

/** Get scheduled day numbers from all classes */
const scheduledDayNumbers = computed(() => {
  const days = new Set();
  myClasses.value.forEach(cls => {
    if (cls.schedule_day && dayNameToNumber[cls.schedule_day] !== undefined) {
      days.add(dayNameToNumber[cls.schedule_day]);
    }
    if (cls.schedule_day_2 && dayNameToNumber[cls.schedule_day_2] !== undefined) {
      days.add(dayNameToNumber[cls.schedule_day_2]);
    }
  });
  return days;
});

/** Generate calendar days for current month */
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const days = [];
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  // Empty cells for days before the 1st
  for (let i = 0; i < startingDay; i++) {
    days.push({ day: null, isToday: false, hasClass: false });
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    days.push({
      day,
      isToday: isCurrentMonth && today.getDate() === day,
      hasClass: scheduledDayNumbers.value.has(dayOfWeek)
    });
  }

  return days;
});

/** Navigate to previous month */
const prevMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentDate.value = newDate;
};

/** Navigate to next month */
const nextMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentDate.value = newDate;
};

const { lecturerProfile, isLoading, errorMessage, fetchLecturerProfile } = useLecturerProfile();

const user = computed(() => ({
  name: lecturerProfile.value?.nama_lengkap || lecturerProfile.value?.fullname || authStore.user?.username || authStore.user?.email?.split('@')[0] || 'Lecturer',
}));

/** Get time-based greeting */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
};

const greeting = ref(getGreeting());

const myClasses = ref([]);
const allStudents = ref([]);
const levels = ref([]);
const dataLoading = ref(false);
const dataError = ref(null);

/** Calculate total students across all classes */
const totalStudents = computed(() => {
  if (myClasses.value.length === 0) return 0;
  const classIds = myClasses.value.map(c => c.classid);
  return allStudents.value.filter(s => classIds.includes(s.classid)).length;
});

/** Dynamic stats */
const stats = computed(() => [
  { title: 'Active Classes', value: myClasses.value.length.toString() },
  { title: 'Total Students', value: `${totalStudents.value} students` }
]);

/** Get level name by id */
const getLevelName = (levelid) => {
  const level = levels.value.find(l => l.levelid === levelid);
  return level?.name || '-';
};

/** Get student count for class */
const getStudentCount = (classid) => {
  return allStudents.value.filter(s => s.classid === classid).length;
};

/** Format class schedule for display */
const formatSchedule = (cls) => {
  if (!cls) return null;

  const schedules = [];

  // Primary schedule
  if (cls.schedule_day && cls.schedule_time) {
    const day = cls.schedule_day.substring(0, 3); // Mon, Tue, etc.
    const time = cls.schedule_time.substring(0, 5); // HH:MM
    schedules.push(`${day} ${time}`);
  }

  // Secondary schedule
  if (cls.schedule_day_2 && cls.schedule_time_2) {
    const day = cls.schedule_day_2.substring(0, 3);
    const time = cls.schedule_time_2.substring(0, 5);
    schedules.push(`${day} ${time}`);
  }

  return schedules.length > 0 ? schedules.join(' & ') : null;
};

/** Fetch lecturer's classes and related data */
const fetchDashboardData = async () => {
  if (!lecturerProfile.value?.lecturerid) return;

  try {
    dataLoading.value = true;
    dataError.value = null;
    const lecturerid = lecturerProfile.value.lecturerid;

    const [classesRes, studentsRes, levelsRes] = await Promise.all([
      classAPI.getAllClasses(),
      studentAPI.getAllStudents(),
      levelAPI.getAllLevels()
    ]);

    if (classesRes.data.success) {
      myClasses.value = classesRes.data.data.filter(c => c.lecturerid === lecturerid);
    }

    if (studentsRes.data.success) {
      allStudents.value = studentsRes.data.data;
    }

    if (levelsRes.data.success) {
      levels.value = levelsRes.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    dataError.value = error.message || 'Failed to load dashboard data';
  } finally {
    dataLoading.value = false;
  }
};

/** Navigate to materials page */
const goToMaterials = () => {
  router.push({ name: 'LecturerMaterials' });
};

/** Navigate to manage students page */
const goToManageStudents = () => {
  router.push({ name: 'LecturerStudents' });
};

/** Quick action items */
const quickActions = computed(() => [
  {
    title: 'Grade Input',
    description: 'Add student grades',
    icon: 'grade',
    color: 'bg-blue-500',
    action: () => router.push({ name: 'LecturerStudents' })
  },
  {
    title: 'Upload Materials',
    description: 'Add course materials',
    icon: 'upload',
    color: 'bg-blue-500',
    action: () => router.push({ name: 'LecturerMaterials' })
  }
]);

const handleLogout = () => {
  authStore.clearAuth();
  router.push('/login');
};

const showError = computed(() => !isLoading.value && errorMessage.value);

/** Auto-fetch dashboard data when profile loads */
watchEffect(() => {
  if (!isLoading.value && lecturerProfile.value) {
    fetchDashboardData();
  }
});

onMounted(() => {
  if (!authStore.isAuthenticated() || authStore.role !== 'lecturer') {
    router.push('/login');
    return;
  }

  if (!lecturerProfile.value && authStore.role === 'lecturer') {
    fetchLecturerProfile();
  }
});
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading || dataLoading" class="max-w-2xl mx-auto py-20">
    <LoadingBar :loading="true" color="blue" :duration="2000" />
  </div>

  <!-- Error State -->
  <div v-else-if="showError" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"></path>
        </svg>
        <p class="text-red-700">{{ errorMessage }}</p>
      </div>
      <button @click="fetchLecturerProfile"
        class="px-4 py-2 text-sm font-semibold text-red-700 hover:text-white bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-600 hover:to-rose-600 border-2 border-red-200 hover:border-red-600 rounded-full transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95">
        Retry
      </button>
    </div>
  </div>

  <!-- Dashboard Data Error -->
  <div v-else-if="dataError" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"></path>
        </svg>
        <p class="text-red-700">{{ dataError }}</p>
      </div>
      <button @click="fetchDashboardData"
        class="px-4 py-2 text-sm font-semibold text-red-700 hover:text-white bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-600 hover:to-rose-600 border-2 border-red-200 hover:border-red-600 rounded-full transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95">
        Retry
      </button>
    </div>
  </div>

  <!-- Main Dashboard Content -->
  <div v-else>
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-3xl shadow-lg mb-8 overflow-hidden">
      <div class="flex flex-col lg:flex-row items-center">
        <!-- Left: Text Content -->
        <div class="flex-1 p-5 md:p-8 lg:p-12">
          <h1 class="text-lg md:text-2xl lg:text-2xl font-semibold text-white/90 mb-2">
            Welcome, {{ greeting }}
          </h1>
          <h2 class="text-2xl md:text-4xl lg:text-4xl font-bold text-white mb-6 leading-tight">
            {{ user.name }}
          </h2>
          <p class="text-white/80 text-sm md:text-base lg:text-2x1 leading-relaxed max-w-lg">
            Ready to inspire and educate your students today. Your dedication shapes their future success.
          </p>
        </div>

        <!-- Right: SVG Illustration -->
        <div class="w-full lg:w-1/2 p-8 lg:p-12 hidden md:flex items-center justify-center">
          <svg class="w-auto max-w-[16rem] h-40 text-gray-800 dark:text-white" aria-hidden="true" width="609"
            height="495" viewBox="0 0 609 495" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M584.052 275.388C584.052 277.731 583.625 279.974 582.846 282.044C582.197 283.766 582.641 285.782 584.047 286.97C590.409 292.342 594.45 300.378 594.45 309.357C594.45 312.534 593.944 315.594 593.008 318.459C592.523 319.946 592.932 321.602 594.094 322.65C602.826 330.517 608.315 341.913 608.315 354.591C608.315 378.328 589.072 397.571 565.334 397.571C541.597 397.571 522.354 378.328 522.354 354.591C522.354 342.031 527.741 330.73 536.33 322.871C537.484 321.815 537.881 320.155 537.384 318.672C536.403 315.745 535.872 312.613 535.872 309.357C535.872 300.378 539.912 292.342 546.274 286.97C547.68 285.782 548.124 283.766 547.476 282.044C546.697 279.974 546.27 277.731 546.27 275.388C546.27 264.955 554.728 256.498 565.161 256.498C575.594 256.498 584.052 264.955 584.052 275.388Z"
              fill="#d6e2fb" />
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M564.987 274.215C565.54 274.215 565.987 274.663 565.987 275.215L565.987 441.245C565.987 441.798 565.54 442.245 564.987 442.245C564.435 442.245 563.987 441.798 563.987 441.245L563.987 275.215C563.987 274.663 564.435 274.215 564.987 274.215Z"
              fill="#9ab7f6" />
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M584.633 349.271C585.082 349.592 585.187 350.217 584.866 350.666L565.802 377.356C565.481 377.805 564.856 377.909 564.407 377.588C563.957 377.267 563.853 376.643 564.174 376.193L583.238 349.504C583.559 349.054 584.184 348.95 584.633 349.271Z"
              fill="#9ab7f6" />
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M545.343 308.023C544.893 308.344 544.789 308.969 545.11 309.418L564.174 336.108C564.495 336.557 565.12 336.661 565.569 336.34C566.018 336.019 566.122 335.395 565.801 334.945L546.737 308.256C546.416 307.806 545.792 307.702 545.343 308.023Z"
              fill="#9ab7f6" />
            <path
              d="M538.043 417.336C537.993 416.199 538.902 415.249 540.041 415.249H590.281C591.42 415.249 592.329 416.199 592.279 417.336L588.988 492.365C588.941 493.435 588.061 494.278 586.99 494.278H543.332C542.261 494.278 541.381 493.435 541.334 492.365L538.043 417.336Z"
              fill="#d6e2fb" />
            <path
              d="M538.043 417.336C537.993 416.199 538.902 415.249 540.041 415.249H590.281C591.42 415.249 592.329 416.199 592.279 417.336L588.988 492.365C588.941 493.435 588.061 494.278 586.99 494.278H543.332C542.261 494.278 541.381 493.435 541.334 492.365L538.043 417.336Z"
              fill="url(#paint0_linear_186_1570)" />
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M24.2629 275.388C24.2629 277.731 24.6893 279.974 25.4687 282.044C26.1171 283.766 25.673 285.782 24.2672 286.97C17.905 292.342 13.8644 300.378 13.8644 309.357C13.8644 312.534 14.3703 315.594 15.306 318.459C15.7918 319.946 15.3825 321.602 14.2203 322.65C5.48885 330.517 -0.000366211 341.913 -0.000366211 354.591C-0.000366211 378.328 19.2427 397.571 42.9803 397.571C66.7179 397.571 85.9609 378.328 85.9609 354.591C85.9609 342.031 80.5739 330.73 71.9843 322.871C70.83 321.815 70.4334 320.155 70.9307 318.672C71.9115 315.745 72.4428 312.613 72.4428 309.357C72.4428 300.378 68.4022 292.342 62.04 286.97C60.6342 285.782 60.1901 283.766 60.8385 282.044C61.6179 279.974 62.0443 277.731 62.0443 275.388C62.0443 264.955 53.5867 256.498 43.1536 256.498C32.7205 256.498 24.2629 264.955 24.2629 275.388Z"
              fill="#d6e2fb" />
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M43.3271 274.215C42.7749 274.215 42.3271 274.663 42.3271 275.215L42.3271 441.245C42.3271 441.798 42.7749 442.245 43.3271 442.245C43.8794 442.245 44.3271 441.798 44.3271 441.245L44.3271 275.215C44.3271 274.663 43.8794 274.215 43.3271 274.215Z"
              fill="#9ab7f6" />
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M23.6814 349.271C23.232 349.592 23.1279 350.217 23.4489 350.666L42.5129 377.356C42.8339 377.805 43.4584 377.909 43.9079 377.588C44.3573 377.267 44.4614 376.643 44.1404 376.193L25.0764 349.504C24.7553 349.054 24.1308 348.95 23.6814 349.271Z"
              fill="#9ab7f6" />
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M62.9719 308.023C63.4213 308.344 63.5254 308.969 63.2044 309.418L44.1404 336.108C43.8194 336.557 43.1949 336.661 42.7455 336.34C42.2961 336.019 42.192 335.395 42.513 334.945L61.577 308.256C61.898 307.806 62.5225 307.702 62.9719 308.023Z"
              fill="#9ab7f6" />
            <path d="M70.3633 415.249H15.9442L19.4104 494.278H66.8971L70.3633 415.249Z" fill="#d6e2fb" />
            <path d="M70.3633 415.249H15.9442L19.4104 494.278H66.8971L70.3633 415.249Z"
              fill="url(#paint1_linear_186_1570)" />
            <path
              d="M147.659 6.00001C147.659 2.68631 150.345 0 153.659 0H466.787C470.101 0 472.787 2.68629 472.787 6V310.809C472.787 314.123 470.101 316.809 466.787 316.809H153.659C150.345 316.809 147.659 314.123 147.659 310.809V6.00001Z"
              fill="#d6e2fb" />
            <path
              d="M220.103 153.086C220.103 151.429 221.446 150.086 223.103 150.086H397.691C399.347 150.086 400.691 151.429 400.691 153.086V175.508C400.691 177.165 399.347 178.508 397.691 178.508H223.103C221.446 178.508 220.103 177.165 220.103 175.508V153.086Z"
              fill="white" />
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M269.322 164.297C269.322 163.531 269.943 162.91 270.709 162.91H350.084C350.85 162.91 351.471 163.531 351.471 164.297C351.471 165.063 350.85 165.683 350.084 165.683H270.709C269.943 165.683 269.322 165.063 269.322 164.297Z"
              fill="#d6e2fb" />
            <path
              d="M220.103 197.799C220.103 196.142 221.446 194.799 223.103 194.799H397.691C399.347 194.799 400.691 196.142 400.691 197.799V220.222C400.691 221.879 399.347 223.222 397.691 223.222H223.103C221.446 223.222 220.103 221.879 220.103 220.222V197.799Z"
              fill="white" />
            <path
              d="M254.765 209.009C254.765 210.732 253.368 212.129 251.645 212.129C249.922 212.129 248.525 210.732 248.525 209.009C248.525 207.286 249.922 205.89 251.645 205.89C253.368 205.89 254.765 207.286 254.765 209.009Z"
              fill="#d6e2fb" />
            <path
              d="M266.55 209.009C266.55 210.732 265.153 212.129 263.43 212.129C261.707 212.129 260.311 210.732 260.311 209.009C260.311 207.286 261.707 205.89 263.43 205.89C265.153 205.89 266.55 207.286 266.55 209.009Z"
              fill="#d6e2fb" />
            <path
              d="M278.335 209.009C278.335 210.732 276.938 212.129 275.215 212.129C273.492 212.129 272.096 210.732 272.096 209.009C272.096 207.286 273.492 205.89 275.215 205.89C276.938 205.89 278.335 207.286 278.335 209.009Z"
              fill="#d6e2fb" />
            <path
              d="M290.12 209.009C290.12 210.732 288.723 212.129 287 212.129C285.278 212.129 283.881 210.732 283.881 209.009C283.881 207.286 285.278 205.89 287 205.89C288.723 205.89 290.12 207.286 290.12 209.009Z"
              fill="#d6e2fb" />
            <path
              d="M301.904 209.009C301.904 210.732 300.507 212.129 298.785 212.129C297.062 212.129 295.665 210.732 295.665 209.009C295.665 207.286 297.062 205.89 298.785 205.89C300.507 205.89 301.904 207.286 301.904 209.009Z"
              fill="#d6e2fb" />
            <path
              d="M313.689 209.009C313.689 210.732 312.293 212.129 310.57 212.129C308.847 212.129 307.45 210.732 307.45 209.009C307.45 207.286 308.847 205.89 310.57 205.89C312.293 205.89 313.689 207.286 313.689 209.009Z"
              fill="#d6e2fb" />
            <path
              d="M325.474 209.009C325.474 210.732 324.078 212.129 322.355 212.129C320.632 212.129 319.235 210.732 319.235 209.009C319.235 207.286 320.632 205.89 322.355 205.89C324.078 205.89 325.474 207.286 325.474 209.009Z"
              fill="#d6e2fb" />
            <path
              d="M337.26 209.009C337.26 210.732 335.863 212.129 334.14 212.129C332.417 212.129 331.021 210.732 331.021 209.009C331.021 207.286 332.417 205.89 334.14 205.89C335.863 205.89 337.26 207.286 337.26 209.009Z"
              fill="#d6e2fb" />
            <path
              d="M349.045 209.009C349.045 210.732 347.648 212.129 345.925 212.129C344.202 212.129 342.806 210.732 342.806 209.009C342.806 207.286 344.202 205.89 345.925 205.89C347.648 205.89 349.045 207.286 349.045 209.009Z"
              fill="#d6e2fb" />
            <path
              d="M360.83 209.009C360.83 210.732 359.433 212.129 357.71 212.129C355.987 212.129 354.591 210.732 354.591 209.009C354.591 207.286 355.987 205.89 357.71 205.89C359.433 205.89 360.83 207.286 360.83 209.009Z"
              fill="#d6e2fb" />
            <path
              d="M372.615 209.009C372.615 210.732 371.218 212.129 369.496 212.129C367.773 212.129 366.376 210.732 366.376 209.009C366.376 207.286 367.773 205.89 369.496 205.89C371.218 205.89 372.615 207.286 372.615 209.009Z"
              fill="#d6e2fb" />
            <path
              d="M355.284 78.162C355.284 102.952 335.187 123.049 310.397 123.049C285.606 123.049 265.51 102.952 265.51 78.162C265.51 53.3715 285.606 33.2749 310.397 33.2749C335.187 33.2749 355.284 53.3715 355.284 78.162Z"
              fill="white" />
            <path
              d="M310.137 76.3858C313.906 76.3858 316.961 73.3305 316.961 69.5617C316.961 65.7929 313.906 62.7377 310.137 62.7377C306.368 62.7377 303.313 65.7929 303.313 69.5617C303.313 73.3305 306.368 76.3858 310.137 76.3858Z"
              fill="#d6e2fb" />
            <path
              d="M306.237 82.2349H314.036C316.105 82.2349 318.088 83.0566 319.551 84.5192C321.014 85.9818 321.835 87.9655 321.835 90.0338V93.9333H298.438V90.0338C298.438 87.9655 299.26 85.9818 300.723 84.5192C302.185 83.0566 304.169 82.2349 306.237 82.2349Z"
              fill="#d6e2fb" />
            <defs>
              <linearGradient id="paint0_linear_186_1570" x1="657.673" y1="468.867" x2="500.117" y2="468.867"
                gradientUnits="userSpaceOnUse">
                <stop stop-color="#9ab7f6" />
                <stop offset="1" stop-color="#9ab7f6" stop-opacity="0" />
              </linearGradient>
              <linearGradient id="paint1_linear_186_1570" x1="-49.3586" y1="468.867" x2="108.197" y2="468.867"
                gradientUnits="userSpaceOnUse">
                <stop stop-color="#9ab7f6" />
                <stop offset="1" stop-color="#9ab7f6" stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>

    <!-- New Grid Layout Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[auto_auto] gap-6">

      <!-- Top-Left Large Card: Active Classes & Today's Schedule (Span 2 cols, 1 row) -->
      <div
        class="lg:col-span-2 lg:row-span-1 bg-blue-50 border border-gray-100 shadow-lg rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
        <div class="flex items-start justify-between mb-6">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-2">Active Classes</p>
            <p class="text-5xl font-bold text-gray-900 mb-2">{{ myClasses.length }}</p>
            <p class="text-sm text-gray-400">Total teaching assignments</p>
          </div>
          <div class="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
            <IconCheckCircle class="w-7 h-7 text-blue-600" />
          </div>
        </div>

        <!-- Schedule Section -->
        <div class="mt-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
              <IconClock class="w-4 h-4 text-blue-600" />
              Schedule
            </h3>
            <button @click="goToMaterials"
              class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-blue-300 transition-all shadow-md hover:shadow-lg">
              View All
            </button>
          </div>

          <!-- No Classes -->
          <div v-if="myClasses.length === 0" class="text-center py-6 text-gray-500">
            <IconCalendar class="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p class="text-sm">No classes scheduled today</p>
          </div>

          <!-- Schedule Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div v-for="cls in myClasses.slice(0, 6)" :key="cls.classid"
              class="bg-blue-50 rounded-2xl p-3 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
              <div class="flex items-start gap-2">
                <div
                  class="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IconBook class="w-4 h-4 text-white" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1 mb-1">
                    <h4 class="text-xs font-semibold text-gray-900 truncate">{{ cls.class_code }}</h4>
                    <span class="text-xs px-1.5 py-0.5 rounded-full text-blue-600 bg-blue-50">
                      {{ getLevelName(cls.levelid) }}
                    </span>
                  </div>
                  <div v-if="formatSchedule(cls)" class="flex items-center gap-1 mt-1">
                    <IconClock class="w-3 h-3 text-blue-600 flex-shrink-0" />
                    <span class="text-xs text-gray-700 font-medium">{{ formatSchedule(cls) }}</span>
                  </div>
                  <span class="text-xs text-gray-500 mt-0.5 block">{{ getStudentCount(cls.classid) }} students</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top-Right: Stats Cards (Total Students & Total Classes) -->
      <div class="lg:col-span-1 lg:row-span-1 grid grid-cols-1 gap-4">
        <!-- Total Students Card -->
        <div
          class="relative bg-blue-50 border border-gray-100 shadow-lg rounded-3xl p-5 hover:shadow-xl transition-all duration-300">
          <div class="absolute top-4 right-4">
            <div class="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <IconUsersGroup class="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Total Students</p>
            <p class="text-4xl font-bold text-gray-900">{{ totalStudents }}</p>
            <p class="text-xs text-gray-400 mt-1">across all classes</p>
          </div>
        </div>

        <!-- Total Classes Card -->
        <div
          class="relative bg-blue-50 border border-gray-100 shadow-lg rounded-3xl p-5 hover:shadow-xl transition-all duration-300">
          <div class="absolute top-4 right-4">
            <div class="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <IconBook class="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Total Classes</p>
            <p class="text-4xl font-bold text-gray-900">{{ myClasses.length }}</p>
            <p class="text-xs text-gray-400 mt-1">teaching assignments</p>
          </div>
        </div>
      </div>

      <!-- Bottom Row: 3 Cards - Quick Actions | Calendar | Daily Inspiration -->
      <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">

        <!-- Left: Quick Actions -->
        <div class="bg-blue-50 border border-gray-100 shadow-lg rounded-2xl p-4 flex flex-col">
          <h2 class="text-sm font-bold text-gray-900 mb-3">Quick Actions</h2>
          <div class="grid grid-cols-2 gap-2 flex-1">
            <button v-for="action in quickActions" :key="action.title" @click="action.action" class="group h-full">
              <div
                class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col items-center justify-center text-center h-full">
                <div
                  :class="`w-11 h-11 ${action.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 mb-2`">
                  <IconDocument v-if="action.icon === 'grade'" class="w-5 h-5 text-white" />
                  <IconUpload v-else-if="action.icon === 'upload'" class="w-5 h-5 text-white" />
                </div>
                <h3 class="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {{ action.title }}
                </h3>
                <p class="text-xs text-gray-500 mt-0.5">{{ action.description }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Center: Schedule Calendar -->
        <div class="bg-blue-50 border border-gray-100 shadow-lg rounded-2xl p-4">
          <!-- Header with navigation -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                <IconCalendar class="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-gray-800">Schedule</h3>
                <p class="text-xs text-gray-500">{{ calendarTitle }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button @click="prevMonth"
                class="w-6 h-6 rounded-md bg-white hover:bg-blue-100 flex items-center justify-center transition-colors border border-gray-100">
                <IconChevronLeft class="w-3 h-3 text-gray-600" />
              </button>
              <button @click="nextMonth"
                class="w-6 h-6 rounded-md bg-white hover:bg-blue-100 flex items-center justify-center transition-colors border border-gray-100">
                <IconChevronRight class="w-3 h-3 text-gray-600" />
              </button>
            </div>
          </div>

          <!-- Calendar Grid -->
          <div>
            <!-- Week days header -->
            <div class="grid grid-cols-7 gap-0.5 mb-1">
              <div v-for="day in weekDays" :key="day" class="text-center text-xs font-medium text-gray-400 py-0.5">
                {{ day.charAt(0) }}
              </div>
            </div>

            <!-- Days grid -->
            <div class="grid grid-cols-7 gap-0.5">
              <div v-for="(dayData, index) in calendarDays" :key="index"
                class="relative h-8 flex items-center justify-center">
                <span v-if="dayData.day" :class="[
                  'text-xs w-6 h-6 flex items-center justify-center rounded-full transition-colors',
                  dayData.isToday ? 'bg-blue-500 text-white font-bold' : 'text-gray-600 hover:bg-white',
                  !dayData.isToday && dayData.hasClass ? 'bg-white' : ''
                ]">
                  {{ dayData.day }}
                </span>
                <!-- Class indicator dot -->
                <span v-if="dayData.day && dayData.hasClass && !dayData.isToday"
                  class="absolute bottom-0.5 w-1 h-1 bg-blue-500 rounded-full"></span>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="mt-2 pt-2 border-t border-gray-200 flex items-center justify-center gap-3">
            <div class="flex items-center gap-1">
              <span class="w-1 h-1 bg-blue-500 rounded-full"></span>
              <span class="text-xs text-gray-400">Class</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span class="text-xs text-gray-400">Today</span>
            </div>
          </div>
        </div>

        <!-- Right: Daily Inspiration (beautiful design) -->
        <div
          class="bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-400 shadow-lg rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <!-- Decorative background pattern -->
          <div class="absolute top-0 right-0 w-32 h-32 opacity-10">
            <svg viewBox="0 0 100 100" fill="currentColor" class="text-white">
              <circle cx="80" cy="20" r="40" />
            </svg>
          </div>

          <!-- Header -->
          <div class="flex items-center gap-2 mb-3 relative z-10">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <IconLightbulb class="w-4 h-4 text-white" />
            </div>
            <h3 class="text-sm font-bold text-white">Daily Inspiration</h3>
          </div>

          <!-- Quote Content -->
          <div class="flex-1 flex flex-col justify-center relative z-10">
            <!-- Large quote mark -->
            <svg class="w-8 h-8 text-white/20 mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>

            <p class="text-sm text-white/90 italic leading-relaxed">
              {{ dailyQuote.quote }}
            </p>

            <p class="text-xs text-white/70 font-medium mt-3">
              — {{ dailyQuote.author }}
            </p>
          </div>

          <!-- Footer -->
          <div class="mt-3 pt-2 border-t border-white/20 relative z-10">
            <p class="text-xs text-white/50 text-center">New quote every day</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
