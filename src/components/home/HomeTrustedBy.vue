<template>
  <section class="brutal-ticker py-2.5 overflow-hidden">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-6">
      <span class="shrink-0 bg-white text-black border-[2px] border-black px-2 py-1 text-[11px] font-black">TRUSTED BY →</span>
      <UMarquee pause-on-hover :repeat="6" class="flex-1">
        <div v-for="logo in logos" :key="logo.alt" class="mx-6 flex items-center justify-center h-8 shrink-0 grayscale contrast-125">
          <img :src="logo.src" :alt="logo.alt" loading="lazy" decoding="async" class="max-h-8 max-w-[120px] object-contain invert brightness-0" />
        </div>
      </UMarquee>
      <span class="hidden md:inline shrink-0 font-mono text-[11px]">EST. 1960 • PEKANBARU</span>
    </div>
  </section>
</template>

<script setup>
const logos = [
  { src: '/logo/kemenkes.webp', alt: 'Kemenkes' },
  { src: '/logo/mandirisyariah.webp', alt: 'Mandiri Syariah' },
  { src: '/logo/panasonic.webp', alt: 'Panasonic' }
]
</script>
