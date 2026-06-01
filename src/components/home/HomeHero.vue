<template>
  <section class="relative bg-hero-sky overflow-hidden">
    <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div class="text-center lg:text-left">
          <h1 class="reveal text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white"
              style="
                text-shadow:
                  2px 2px 0 var(--color-hero-sky-deep),
                  4px 4px 0 var(--color-hero-sky-deep),
                  6px 6px 0 var(--color-hero-sky-deep),
                  8px 8px 0 oklch(0.35 0.10 235);
              ">
            Kuasai Bahasa Inggris Bersama <span class="text-sun-yellow">ITTR English Course</span>
          </h1>
          <p class="reveal mt-6 text-lg md:text-xl text-white/85 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
             data-delay="80">
            Lembaga kursus bahasa Inggris terpercaya di Pekanbaru dengan pengalaman lebih dari 60 tahun. Bergabunglah dan raih tujuanmu.
          </p>
          <div class="reveal mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
               data-delay="160">
            <button
              type="button"
              class="bg-sun-yellow text-ink-warm hover:bg-sun-yellow-deep font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun-yellow/50"
            >
              Mulai Belajar
            </button>
            <button
              type="button"
              class="border-2 border-white/60 text-white hover:bg-white/15 hover:border-white font-semibold px-8 py-3 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              Lihat Program Kami
            </button>
          </div>
        </div>
        <div class="reveal hidden lg:flex justify-center" data-delay="240">
          <div class="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
              alt="Siswa belajar bahasa Inggris bersama di kelas"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      ref="cursorGlow"
      class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700"
      :style="cursorGlowStyle"
    />
    <div class="absolute top-12 left-8 w-16 h-16 text-white/15 rotate-12" data-parallax-speed="0.35">
      <AbcBlockSvg />
    </div>
    <div class="absolute top-20 right-12 w-14 h-14 text-white/12 -rotate-6" data-parallax-speed="0.25">
      <BookSvg />
    </div>
    <div class="absolute bottom-24 left-16 w-12 h-12 text-white/12 -rotate-12" data-parallax-speed="0.15">
      <SpeechBubbleSvg />
    </div>
    <div class="absolute bottom-32 right-20 w-10 h-10 text-white/15 rotate-20" data-parallax-speed="0.20">
      <GradCapSvg />
    </div>
    <div class="absolute top-1/2 left-6 w-8 h-8 text-white/10 rotate-45" data-parallax-speed="0.10">
      <PencilSvg />
    </div>
    <div class="absolute top-1/3 right-10 w-11 h-11 text-white/10 -rotate-15" data-parallax-speed="0.12">
      <GlobeSvg />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AbcBlockSvg from './illustrations/AbcBlockSvg.vue'
import BookSvg from './illustrations/BookSvg.vue'
import SpeechBubbleSvg from './illustrations/SpeechBubbleSvg.vue'
import GradCapSvg from './illustrations/GradCapSvg.vue'
import PencilSvg from './illustrations/PencilSvg.vue'
import GlobeSvg from './illustrations/GlobeSvg.vue'

const cursorGlow = ref(null)
const mouseX = ref(0.5)
const mouseY = ref(0.5)
const glowActive = ref(false)
let glowTimer

const cursorGlowStyle = computed(() => ({
  background: `radial-gradient(600px at ${mouseX.value * 100}% ${mouseY.value * 100}%, rgba(255,255,255,0.07), transparent 60%)`
}))

function onMouseMove(e) {
  const section = cursorGlow.value?.parentElement
  if (!section) return
  const rect = section.getBoundingClientRect()
  mouseX.value = (e.clientX - rect.left) / rect.width
  mouseY.value = (e.clientY - rect.top) / rect.height
  if (!glowActive.value) {
    glowActive.value = true
    if (cursorGlow.value) cursorGlow.value.style.opacity = '1'
  }
  clearTimeout(glowTimer)
  glowTimer = setTimeout(() => {
    glowActive.value = false
    if (cursorGlow.value) cursorGlow.value.style.opacity = '0'
  }, 3000)
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  clearTimeout(glowTimer)
})
</script>
