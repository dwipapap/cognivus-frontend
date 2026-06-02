<template>
  <section class="bg-white py-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <p class="reveal text-center text-sm font-medium tracking-wide text-muted uppercase mb-8">
        Dipercaya Oleh
      </p>
      <UMarquee
        class="reveal"
        data-delay="60"
        pause-on-hover
        :repeat="5"
      >
        <div
          v-for="logo in logos"
          :key="logo.alt"
          class="flex items-center justify-center w-36 h-16 px-4 mx-4 md:mx-6 shrink-0"
        >
          <img :src="logo.src" :alt="logo.alt" class="max-h-full max-w-full object-contain" />
        </div>
      </UMarquee>
    </div>
  </section>
</template>

<script setup>
const logos = [
  { src: '/logo/kemenkes.webp', alt: 'Kemenkes' },
  { src: '/logo/mandirisyariah.webp', alt: 'Mandiri Syariah' },
  { src: '/logo/panasonic.webp', alt: 'Panasonic' },
]
</script>
