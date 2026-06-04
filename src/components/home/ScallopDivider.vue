<template>
  <div class="scallop-divider relative h-8 sm:h-12 md:h-16 -mb-px overflow-hidden">
    <svg
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
      class="absolute bottom-0 w-full h-full"
    >
      <path
        d="M0,0 C240,100 480,0 720,100 C960,0 1200,100 1440,0 L1440,100 L0,100 Z"
        :fill="fill"
      />
    </svg>
  </div>
</template>

<script setup>
defineProps({
  fill: { type: String, default: 'white' }
})
</script>
