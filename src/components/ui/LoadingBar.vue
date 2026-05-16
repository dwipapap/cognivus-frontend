<script setup>
import { ref, onUnmounted, watch } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 2000
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'danger', 'info'].includes(value)
  }
});

const progress = ref(0);
let interval = null;

const colorClasses = {
  primary: 'bg-brand-primary',
  success: 'bg-brand-success',
  danger: 'bg-brand-danger',
  info: 'bg-brand-info'
};

const startProgress = () => {
  progress.value = 0;
  const increment = 100 / (props.duration / 50);

  interval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += increment;
    } else if (progress.value < 95) {
      progress.value += increment * 0.3;
    } else {
      progress.value += increment * 0.1;
    }

    if (progress.value >= 100) {
      progress.value = 100;
      clearInterval(interval);
    }
  }, 50);
};

const completeProgress = () => {
  progress.value = 100;
  setTimeout(() => {
    progress.value = 0;
  }, 300);
};

watch(() => props.loading, (newVal) => {
  if (newVal) {
    startProgress();
  } else {
    completeProgress();
    if (interval) {
      clearInterval(interval);
    }
  }
}, { immediate: true });

onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});
</script>

<template>
  <Transition name="fade">
    <div v-if="loading || progress > 0" class="w-full">
      <div class="relative h-1.5 bg-divider rounded-token-full overflow-hidden">
        <div
          class="absolute top-0 left-0 h-full rounded-token-full transition-all duration-token-default ease-out"
          :class="colorClasses[color]"
          :style="{ width: `${progress}%` }"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 250ms cubic-bezier(0, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
</style>
