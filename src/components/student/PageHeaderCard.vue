<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  showDecoration: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <div class="relative bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-xl shadow-lg overflow-hidden min-h-[140px] md:min-h-[160px] p-6 md:p-8 flex flex-col justify-center">
    <!-- Diagonal Book Graphics (Decoration) -->
    <div v-if="showDecoration" class="absolute top-0 right-0 w-1/2 h-full pointer-events-none overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-48 bg-blue-400/30 rounded-lg transform rotate-12"></div>
      <div class="absolute top-20 -right-5 w-32 h-40 bg-blue-300/40 rounded-lg transform rotate-12"></div>
      <div class="absolute top-40 right-10 w-28 h-36 bg-white/20 rounded-lg transform rotate-12"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex-1">
        <p v-if="eyebrow" class="text-white/80 text-sm mb-1">{{ eyebrow }}</p>
        <!-- Use h2 to avoid multiple h1s if an h1 already exists on the page, but keep styling large -->
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2 leading-tight">{{ title }}</h2>
        <p v-if="description" class="text-white/70 text-sm md:text-base max-w-md">
          {{ description }}
        </p>
      </div>
      <div v-if="$slots.action" class="flex-shrink-0 mt-2 sm:mt-0">
        <slot name="action"></slot>
      </div>
    </div>
  </div>
</template>
