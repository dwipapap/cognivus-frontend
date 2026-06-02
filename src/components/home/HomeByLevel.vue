<template>
  <section class="bg-white py-16 md:py-24">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="reveal max-w-3xl mx-auto text-center mb-14">
        <h2 class="text-3xl md:text-4xl font-bold text-ink leading-tight">
          Pembelajaran Berdasarkan Level
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-reveal-stagger="0.1">
        <div
          v-for="(program, i) in programs"
          :key="i"
          class="reveal group rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          :class="program.bg"
          :data-delay="i * 80"
        >
          <div class="aspect-[4/3] overflow-hidden">
            <img
              :src="program.image"
              :alt="program.label"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div class="p-5">
            <p class="text-sm font-medium tracking-wide uppercase text-ink-muted/70 mb-1">{{ program.tag }}</p>
            <h3 class="text-lg font-bold text-ink">{{ program.label }}</h3>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const programs = [
  {
    label: 'English for Young Learner',
    tag: 'Anak-anak',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
    bg: 'bg-card-green'
  },
  {
    label: 'English for Young Adults',
    tag: 'Remaja & Mahasiswa',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
    bg: 'bg-card-orange'
  },
  {
    label: 'English for Professional',
    tag: 'Profesional',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80',
    bg: 'bg-card-purple'
  }
]
</script>
