<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 2000 // 2 seconds default
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'red', 'purple', 'indigo'].includes(value)
  }
});

const progress = ref(0);
let interval = null;

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
  indigo: 'from-indigo-500 to-indigo-600'
};

const startProgress = () => {
  progress.value = 0;
  const increment = 100 / (props.duration / 50); // Update every 50ms
  
  interval = setInterval(() => {
    if (progress.value < 90) {
      // Fast progress to 90%
      progress.value += increment;
    } else if (progress.value < 95) {
      // Slow down near the end
      progress.value += increment * 0.3;
    } else {
      // Very slow crawl at 95%+
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
      <div class="relative h-1.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div 
          class="absolute top-0 left-0 h-full bg-gradient-to-r rounded-full transition-all duration-300 ease-out"
          :class="colorClasses[color]"
          :style="{ width: `${progress}%` }"
        >
          <!-- Shimmer effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>
      
      <!-- Optional loading text -->
      <div class="mt-3 text-center">
        <p class="text-sm text-gray-500 animate-pulse">
          Loading<span class="animate-bounce">.</span><span class="animate-bounce" style="animation-delay: 0.2s">.</span><span class="animate-bounce" style="animation-delay: 0.4s">.</span>
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
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
