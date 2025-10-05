<script setup>
import { ref, computed } from 'vue';
import { authStore } from '../../store/auth';
import { useStudentProfile } from '../../composables/useStudentProfile';
import gambar1 from '../../assets/kucingterbang.png';

const { studentProfile, isLoading } = useStudentProfile();

const user = computed(() => ({
  name: studentProfile.value?.nama_lengkap || authStore.user?.email?.split('@')[0] || 'Student',
}));

// Function to get time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Good Evening';
  } else {
    return 'Good Night';
  }
};

const greeting = ref(getGreeting());

const stats = ref([
  { title: 'Active Classes', value: '1' },
  { title: 'Next Session', value: 'Wed 04:00 PM' },
  { title: 'This Week', value: '4 classes' }
]);

//bagian my classes ini harusnya nanti ambil dari databasesnya,
// jadi nanti envnya harus sama dan juga namanya harus sama dengan yang di database
const myClasses = ref([
  {
    title: 'Grammar Essentials',
    description: 'Master the basics starting from tenses, sentence structure, and common patterns to build strong foundations.',
    nextSession: 'Wed, Sep 3, 04:00 PM',
    image: gambar1
  },
  {
    title: 'Speaking & Conversation',
    description: 'Boost confidence with dialogues, role-plays, and real-life speaking practice.',
    nextSession: 'Thu, Sep 4, 06:30 PM',
    image: 'https://media1.tenor.com/m/L1DyVjuyLqEAAAAd/uma-musume-dance.gif'
  },
  {
    title: 'IELTS Prep',
    description: 'Targeted strategies for Listening, Reading, Writing, and Speaking — with practice tests.',
    nextSession: 'Fri, Sep 5, 07:00 PM',
    image: 'https://media1.tenor.com/m/wdgDOrbSkiwAAAAd/satono-diamond-diamond-satono.gif'
  }
]);
</script>

<template>
  <!-- Welcome Section -->
  <div class="flex flex-col lg:flex-row gap-4 mb-8">
    <!-- bagian welcome card -->
    <div class="flex-1 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-8 shadow-sm">
      <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{{ greeting }},</h1>
      <h2 class="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight lg:leading-[1.1] pb-1 mb-4">{{ user.name }}</h2>
      <p class="text-gray-600 flex items-center text-lg">
        After today's efforts, rest and improve your abilities
      </p>
    </div>

    <!-- Kanan quickstats -->
    <div class="w-full lg:w-[420px] shrink-0">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <!-- Left blue column wrapper -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-4 shadow-sm h-full flex flex-col gap-3">
          <div
            v-for="stat in stats.filter(s => s.title === 'Active Classes' || s.title === 'This Week')"
            :key="stat.title"
            class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow transition-all duration-200 min-h-24 flex items-center gap-4"
          >
            <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path v-if="stat.title === 'Active Classes'" fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6.586l-1.293-1.293a1 1 0 00-1.414 1.414L16 16.414V18a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2zM8 5a1 1 0 011-1h2a1 1 0 011 1v1H8V5zM6 8a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" clip-rule="evenodd"></path>
                <path v-else-if="stat.title === 'Next Session'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                <path v-else fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="flex-1 text-left">
              <p class="text-sm font-medium text-gray-500 mb-1">{{ stat.title }}</p>
              <p class="text-base font-bold text-gray-900">{{ stat.value }}</p>
            </div>
          </div>
        </div>

        <!-- kiri quickstats -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-4 shadow-sm h-full flex flex-col gap-3">
          <div
            v-for="stat in stats.filter(s => s.title === 'Next Session')"
            :key="stat.title"
            class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow transition-all duration-200 min-h-24 flex items-center gap-4"
          >
            <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path v-if="stat.title === 'Active Classes'" fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6.586l-1.293-1.293a1 1 0 00-1.414 1.414L16 16.414V18a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2zM8 5a1 1 0 011-1h2a1 1 0 011 1v1H8V5zM6 8a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" clip-rule="evenodd"></path>
                <path v-else-if="stat.title === 'Next Session'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                <path v-else fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="flex-1 text-left">
              <p class="text-sm font-medium text-gray-500 mb-1">{{ stat.title }}</p>
              <div class="leading-tight">
                <span class="block text-lg font-semibold text-gray-900">{{ stat.value.split(' ')[0] }}</span>
                <span class="block text-xl font-bold text-gray-900">{{ stat.value.split(' ').slice(1).join(' ') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Classes Section -->
  <section class="mt-6">
    <div class="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-8 mb-8 shadow-sm">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Courses</h2>
          <p class="text-sm text-gray-500 dark:text-gray-300 mt-1">Quick access to your ongoing classes and sessions.</p>
        </div>

      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <article v-for="cls in myClasses" :key="cls.title" class="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          <div class="h-44 md:h-48 w-full overflow-hidden bg-gray-100">
            <img :src="cls.image" :alt="cls.title" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">{{ cls.title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-3 truncate">{{ cls.description }}</p>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ cls.nextSession }}</span>
              <button class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:ring-2 focus:ring-blue-300 transition-colors">
                Open Class
                <svg class="w-3.5 h-3.5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                </svg>
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
