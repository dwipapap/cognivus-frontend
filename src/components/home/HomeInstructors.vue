<template>
  <section class="relative bg-white py-16 md:py-24 overflow-hidden">
    <div class="absolute top-16 left-8 w-12 h-12 text-muted/10 rotate-12">
      <BookSvg />
    </div>
    <div class="absolute bottom-20 right-12 w-10 h-10 text-muted/10 -rotate-6">
      <PencilSvg />
    </div>
    <div class="absolute top-1/3 right-8 w-9 h-9 text-muted/10 rotate-20">
      <SpeechBubbleSvg />
    </div>

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="reveal text-center max-w-3xl mx-auto mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-default leading-tight">
          Our Instructors
        </h2>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8" data-reveal-stagger="0.08" data-reveal="fade-left">
        <div
          v-for="(instructor, i) in instructors"
          :key="i"
          class="reveal group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
          :data-delay="(i % 4) * 60"
        >
          <div class="aspect-[4/3]" :class="swatches[i % 4]">
            <img
              :src="instructor.image"
              :alt="instructor.name"
              class="w-full h-full object-cover mix-blend-overlay opacity-85 group-hover:opacity-100 transition-opacity duration-200"
              loading="lazy"
            />
          </div>
          <div class="p-4 bg-sun-yellow">
            <p class="text-sm font-bold text-ink-warm leading-tight">{{ instructor.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import BookSvg from './illustrations/BookSvg.vue'
import PencilSvg from './illustrations/PencilSvg.vue'
import SpeechBubbleSvg from './illustrations/SpeechBubbleSvg.vue'

const swatches = ['bg-swatch-red', 'bg-swatch-blue', 'bg-swatch-green', 'bg-swatch-magenta']

const instructors = [
  { name: 'Ms. Novella Putri Lerian, S.I.P., M.Si', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
  { name: 'Mr. Erdi Tanjung', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80' },
  { name: 'Mr. Sabri Sulaiman, S.Pd', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { name: 'Mr. Rizal, S.Pd', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { name: 'Mrs. Lisa, S.Pd', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80' },
  { name: 'Ms. Ushwatul Jannah, S.I.P., M.Si', image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=400&q=80' },
  { name: 'Ms. Silviana, S.Pd', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' },
  { name: 'Mr. Rahmat, S.Pd', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80' }
]
</script>
