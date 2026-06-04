<template>
  <section class="relative overflow-hidden bg-[var(--color-hero-sky)] rounded-3xl mx-4 my-8">
    <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 800" fill="none" preserveAspectRatio="xMidYMid slice">
      <path d="M-100 400 Q360 200 720 450 T1540 350" stroke="rgba(255,255,255,0.25)" stroke-width="2" stroke-linecap="round" />
      <path d="M-50 500 Q400 300 800 520 T1600 420" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-linecap="round" />
    </svg>

    <div class="relative z-10 px-6 py-16 md:py-24 max-w-7xl mx-auto">
      <div class="text-center mb-16 max-w-2xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          Meet Our
          <span class="relative inline-block">
            <svg class="absolute -top-3 -left-5 w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Instructors
          </span>

        </h2>
        <p class="text-white/85 text-base md:text-lg">
          Our team of certified and passionate educators brings years of experience and expertise to every class. Committed to student success
        </p>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-start">
        <div
          v-for="(instructor, i) in instructors"
          :key="i"
          class="flex flex-col items-center text-center"
          :class="i % 2 === 0 ? 'lg:mt-0' : 'lg:mt-12'"
        >
          <div class="relative mb-4">
            <div class="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                :src="instructor.image"
                :alt="instructor.name"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div class="bg-white rounded-lg p-5 shadow-lg w-full max-w-[200px] relative">
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-white"></div>
            <p class="font-bold text-gray-900 text-sm md:text-base mb-1">{{ instructor.name }}</p>
            <p class="text-[#2ab5a3] text-xs md:text-sm font-medium mb-2">Examiners</p>

          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const instructors = [
  { name: 'Ms. Novella Putri Lerian, S.I.P., M.Si', image: '/instructor/novella.png' },
  { name: 'Mr. Erdi Tanjung', image: '/instructor/erdi-tanjung.png' },
  { name: 'Mr. Sabri Sulaiman, S.Pd', image: '/instructor/sabri.png' },
  { name: 'Mr. Rizal, S.Pd', image: '/instructor/rizal.png' },
  { name: 'Mrs. Lisa, S.Pd', image: '/instructor/lisa.png' },
  { name: 'Ms. Ushwatul Jannah, S.I.P., M.Si', image: '/instructor/ushwatul.png' },
  { name: 'Ms. Silviana, S.Pd', image: '/instructor/silviana.png' },
  { name: 'Mr. Rahmat, S.Pd', image: '/instructor/rahmat.png' }
]
</script>
