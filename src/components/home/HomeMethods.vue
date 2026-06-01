<template>
  <section class="bg-cream py-16 md:py-24">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="reveal text-center max-w-3xl mx-auto mb-12">
        <p class="text-sm font-medium tracking-wide text-coral-red uppercase mb-3">Metode Belajar</p>
        <h2 class="text-3xl md:text-4xl font-bold text-default leading-tight">
          Pilih Kursus Belajar Bahasa Inggris yang Sesuai
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-reveal-stagger="0.08" data-reveal="scale-in">
        <div
          v-for="(card, i) in cards"
          :key="i"
          class="reveal group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col"
          :data-delay="i * 60"
        >
          <div class="h-2" :class="card.barColor"></div>
          <div class="p-6 flex flex-col flex-1">
            <h3 class="text-2xl font-black mb-1" :class="card.headingColor">{{ card.level }}</h3>
            <p class="text-sm font-medium text-muted mb-4">{{ card.subtitle }}</p>
            <p class="text-sm text-muted leading-relaxed mb-6 flex-1">{{ card.description }}</p>
            <button
              type="button"
              :class="card.ctaClass"
              class="self-start rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2"
            >
              Hubungi Kami
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const cards = [
  {
    level: 'Pre Elementary',
    subtitle: 'English for Young Learner',
    description: 'Dapatkan kelas pembelajaran bahasa Inggris Pre Elementary (English for Young Learner). Maksimum per kelas 10 orang.',
    barColor: 'bg-swatch-blue',
    headingColor: 'text-swatch-blue',
    ctaClass: 'bg-swatch-blue text-white hover:bg-swatch-blue/90'
  },
  {
    level: 'Elementary',
    subtitle: 'Pemula',
    description: 'Dapatkan kelas pembelajaran bahasa Inggris Elementary (Pemula). Maksimum per kelas 10 orang.',
    barColor: 'bg-sun-yellow',
    headingColor: 'text-sun-yellow-deep',
    ctaClass: 'bg-sun-yellow text-ink-warm hover:bg-sun-yellow-deep'
  },
  {
    level: 'Intermediate',
    subtitle: 'Mahir',
    description: 'Dapatkan kelas pembelajaran bahasa Inggris Intermediate (Mahir). Maksimum per kelas 10 orang.',
    barColor: 'bg-swatch-red',
    headingColor: 'text-swatch-red',
    ctaClass: 'bg-swatch-red text-white hover:bg-swatch-red/90'
  },
  {
    level: 'Advanced',
    subtitle: 'Ahli',
    description: 'Dapatkan kelas pembelajaran bahasa Inggris Advanced (Ahli). Maksimum per kelas 10 orang.',
    barColor: 'bg-ink-warm',
    headingColor: 'text-ink-warm',
    ctaClass: 'bg-ink-warm text-white hover:bg-ink-warm/90'
  }
]
</script>
