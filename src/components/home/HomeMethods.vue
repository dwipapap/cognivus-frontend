<template>
  <section class="mx-4 my-8">
    <div
        class="reveal bg-[var(--color-hero-sky)] rounded-3xl px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row gap-8 md:gap-0 items-start"
      >
        <div class="md:w-1/3 md:pr-10 md:border-r md:border-white/20">
          <h2 class="text-3xl md:text-4xl font-bold text-white leading-tight">
            Metode<br />
            <span class="italic text-sun-yellow">Belajar</span>
          </h2>
          <p class="mt-4 text-sm text-white/75 leading-relaxed max-w-xs">
            Kursus bahasa Inggris terpercaya dengan instruktur berpengalaman, kapan saja.
          </p>
        </div>

        <div class="md:w-2/3 md:pl-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="(card, i) in cards"
            :key="i"
            class="flex flex-col items-center text-center"
          >
            <div class="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-4">
              <UIcon :name="card.icon" class="size-6" :class="card.iconColor" />
            </div>
            <h3 class="text-white font-semibold text-base mb-1">{{ card.level }}</h3>
            <p class="text-white/70 text-sm leading-relaxed">{{ card.description }}</p>
          </div>
        </div>
      </div>
  </section>
</template>

<script setup>
const cards = [
  {
    level: 'Pre Elementary',
    icon: 'i-lucide-book-open',
    iconColor: 'text-swatch-blue',
    description: 'Dapatkan kelas pembelajaran bahasa Inggris Pre Elementary (English for Young Learner). Maksimum per kelas 10 orang.'
  },
  {
    level: 'Elementary',
    icon: 'i-lucide-pencil',
    iconColor: 'text-sun-yellow-deep',
    description: 'Dapatkan kelas pembelajaran bahasa Inggris Elementary (Pemula). Maksimum per kelas 10 orang.'
  },
  {
    level: 'Intermediate',
    icon: 'i-lucide-graduation-cap',
    iconColor: 'text-swatch-red',
    description: 'Dapatkan kelas pembelajaran bahasa Inggris Intermediate (Mahir). Maksimum per kelas 10 orang.'
  },
  {
    level: 'Advanced',
    icon: 'i-lucide-award',
    iconColor: 'text-swatch-magenta',
    description: 'Dapatkan kelas pembelajaran bahasa Inggris Advanced (Ahli). Maksimum per kelas 10 orang.'
  }
]
</script>
