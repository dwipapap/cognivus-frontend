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
          v-for="i in 6"
          :key="i"
          class="flex items-center justify-center w-36 h-16 border-2 border-dashed border-default rounded-lg px-4 mx-4 md:mx-6 shrink-0"
        >
          <span class="text-xs text-muted text-center">Partner / Institusi {{ i }}</span>
        </div>
      </UMarquee>
    </div>
  </section>
</template>

<script setup>
</script>
