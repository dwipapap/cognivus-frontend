<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  variant: {
    type: String,
    default: 'danger',
    validator: (value) => ['danger', 'warning', 'info'].includes(value)
  },
  persistent: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm', 'cancel', 'close']);

const modalRef = ref(null);

// Variant styles
const variantStyles = computed(() => {
  const styles = {
    danger: {
      icon: 'text-red-600 bg-red-100',
      iconGradient: 'from-red-500 to-rose-600',
      confirmButton: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white border-red-600',
      header: 'from-red-500 via-red-600 to-rose-600'
    },
    warning: {
      icon: 'text-yellow-600 bg-yellow-100',
      iconGradient: 'from-yellow-500 to-amber-600',
      confirmButton: 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white border-yellow-600',
      header: 'from-yellow-500 via-yellow-600 to-amber-600'
    },
    info: {
      icon: 'text-blue-600 bg-blue-100',
      iconGradient: 'from-blue-500 to-indigo-600',
      confirmButton: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-blue-600',
      header: 'from-blue-500 via-blue-600 to-indigo-600'
    }
  };
  return styles[props.variant];
});

// Methods
const handleClose = () => {
  if (!props.persistent) {
    emit('close');
    emit('cancel');
  }
};

const handleConfirm = () => {
  emit('confirm');
  emit('close');
};

const handleCancel = () => {
  emit('cancel');
  emit('close');
};

// Handle escape key
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.show && !props.persistent) {
    handleClose();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// Focus modal when opened
watch(() => props.show, async (newValue) => {
  if (newValue) {
    await nextTick();
    if (modalRef.value) {
      modalRef.value.focus();
    }
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <div
          ref="modalRef"
          class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
          tabindex="-1"
          role="dialog"
          :aria-labelledby="title"
          aria-modal="true"
        >
          <!-- Header with Gradient -->
          <div :class="['bg-gradient-to-r px-6 py-5 flex items-center gap-3', variantStyles.header]">
            <div :class="['w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0']">
              <!-- Danger/Warning Icon (Exclamation Triangle) -->
              <svg v-if="variant === 'danger' || variant === 'warning'" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1-1.964-1-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <!-- Info Icon -->
              <svg v-else class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white flex-1">{{ title }}</h3>
            <button
              v-if="!persistent"
              @click="handleClose"
              class="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all hover:scale-110 active:scale-95"
              aria-label="Close"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-6">
            <p class="text-gray-700 text-base leading-relaxed">{{ message }}</p>
          </div>

          <!-- Footer with Actions -->
          <div class="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
            <button
              @click="handleCancel"
              class="inline-flex items-center px-5 py-2.5 bg-white text-gray-700 border-2 border-gray-300 rounded-full font-semibold text-sm transition-all hover:bg-gray-100 hover:border-gray-400 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
            >
              {{ cancelText }}
            </button>
            <button
              @click="handleConfirm"
              :class="[
                'inline-flex items-center px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg border-2',
                variantStyles.confirmButton
              ]"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Modal transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from > div {
  transform: scale(0.9) translateY(-20px);
}

.modal-leave-to > div {
  transform: scale(0.95) translateY(10px);
}
</style>
