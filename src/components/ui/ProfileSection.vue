<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  defaultOpen: {
    type: Boolean,
    default: false
  }
});

const open = ref(props.defaultOpen);
</script>

<template>
  <section class="bg-[#eff6ff] rounded-xl shadow-sm border border-[#dbeafe] overflow-hidden">
    <button
      type="button"
      class="w-full flex items-center justify-between px-5 py-4 md:px-6 md:py-5 text-left focus:outline-none focus:ring-2 focus:ring-[#bfdbfe]"
      @click="open = !open"
      :aria-expanded="open"
    >
      <h2 class="text-lg md:text-2xl font-bold text-[#155dfc]">{{ title }}</h2>
      <svg
        class="w-5 h-5 md:w-6 md:h-6 text-[#155dfc] transform transition-transform duration-300 ease-out"
        :class="{ 'rotate-180': open }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition-all duration-300 ease-out overflow-hidden"
      leave-active-class="transition-all duration-300 ease-out overflow-hidden"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[1200px] opacity-100"
      leave-from-class="max-h-[1200px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-show="open" class="px-5 pb-5 md:px-6 md:pb-6">
        <slot />
      </div>
    </Transition>
  </section>
</template>
