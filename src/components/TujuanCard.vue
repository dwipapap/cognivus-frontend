<script setup>
import { ref } from 'vue';

const goals = ref([
  {
    title: 'Persiapan Test',
    description: 'Tingkatkan skormu untuk tes TOEFL, IELTS, dan lainnya.',
    iconType: 'test'
  },
  {
    title: 'Kelas Umum',
    description: 'Perlancar kemampuan speaking dan writing untuk sehari-hari.',
    iconType: 'general'
  },
  {
    title: 'Kesuksesan Karir',
    description: 'Siapkan dirimu untuk meeting, presentasi, dan interview kerja.',
    iconType: 'career'
  },
  {
    title: 'Upgrade Kemampuan',
    description: 'Perkaya pengetahuan dan buka wawasan baru lewat bahasa.',
    iconType: 'upgrade'
  }
]);
</script>

<template>
  <div class="bg-base-200 py-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto text-center">
      <h2 class="text-3xl font-extrabold text-base-content sm:text-4xl mb-2">
        Tentukan Tujuan Belajar Inggris
      </h2>
      <p class="text-lg text-base-content/70">Pilih jalur belajar yang paling sesuai dengan target pribadimu.</p>

      <div class="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

        <div v-for="goal in goals" :key="goal.title"
          class="card bg-base-100 shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
          <div class="card-body items-center text-center">

            <div class="mb-4 w-24 h-24 rounded-full bg-neutral flex items-center justify-center">
              <!-- Test Preparation Icon -->
              <svg v-if="goal.iconType === 'test'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-white">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
              <!-- General Class Icon -->
              <svg v-else-if="goal.iconType === 'general'" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-white">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962c.57-1.023.994-2.131 1.253-3.284C13.42 8.69 13.992 7.5 13.992 7.5c0-1.062-.38-2.032-1.03-2.818M15 8.25a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.828 20.25c.382-1.32.932-2.524 1.54-3.562a4.5 4.5 0 0 1 6.262 0c.608 1.038 1.158 2.242 1.54 3.562a4.5 4.5 0 0 1-9.342 0Z" />
              </svg>
              <!-- Career Success Icon -->
              <svg v-else-if="goal.iconType === 'career'" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-white">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M20.25 14.15v4.002a2.25 2.25 0 0 1-2.25 2.25h-10.5a2.25 2.25 0 0 1-2.25-2.25v-4.002m11.25 0a2.25 2.25 0 0 0-2.25-2.25h-3.375a2.25 2.25 0 0 0-2.25 2.25m11.25 0v-4.34a2.25 2.25 0 0 0-2.25-2.25h-2.25a2.25 2.25 0 0 0-2.25 2.25v4.34m-1.125 0H5.625v-4.34a2.25 2.25 0 0 1 2.25-2.25h2.25a2.25 2.25 0 0 1 2.25 2.25v4.34m0 0a2.25 2.25 0 0 1-2.25 2.25h-3.375a2.25 2.25 0 0 1-2.25-2.25m0 0a2.25 2.25 0 0 0 2.25-2.25h3.375a2.25 2.25 0 0 0 2.25 2.25" />
              </svg>
              <!-- Upgrade Skills Icon -->
              <svg v-else-if="goal.iconType === 'upgrade'" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-white">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
            </div>

            <h3 class="card-title text-lg font-semibold">{{ goal.title }}</h3>
            <p>{{ goal.description }}</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped></style>