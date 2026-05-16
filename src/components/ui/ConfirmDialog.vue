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

const variantStyles = computed(() => {
  const styles = {
    danger: {
      icon: 'text-brand-danger bg-brand-danger/10',
      confirmButton: 'bg-brand-danger hover:bg-brand-danger-hover text-white focus:ring-brand-danger-ring',
    },
    warning: {
      icon: 'text-brand-warning bg-brand-warning/10',
      confirmButton: 'bg-brand-warning hover:bg-brand-warning-hover text-white focus:ring-brand-warning-ring',
    },
    info: {
      icon: 'text-brand-primary bg-brand-primary/10',
      confirmButton: 'bg-brand-primary hover:bg-brand-primary-hover text-white focus:ring-brand-primary-ring',
    }
  };
  return styles[props.variant];
});

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
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-overlay"
        @click.self="handleClose"
      >
        <div
          ref="modalRef"
          class="bg-surface rounded-token-3xl shadow-modal-overlay w-full max-w-md overflow-hidden flex flex-col"
          tabindex="-1"
          role="dialog"
          :aria-labelledby="title"
          aria-modal="true"
        >
          <div class="px-6 py-5 flex items-center gap-3">
            <div :class="['w-10 h-10 rounded-token-xl flex items-center justify-center flex-shrink-0', variantStyles.icon]">
              <svg v-if="variant === 'danger' || variant === 'warning'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1-1.964-1-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-ink flex-1">{{ title }}</h3>
            <button
              v-if="!persistent"
              @click="handleClose"
              class="text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-token-full p-2 transition-all duration-token-default"
              aria-label="Close"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="px-6 py-6">
            <p class="text-gray-700 text-base leading-relaxed">{{ message }}</p>
          </div>

          <div class="bg-surface-subtle px-6 py-4 flex justify-end gap-3 border-t border-divider">
            <button
              @click="handleCancel"
              class="inline-flex items-center px-5 py-2.5 bg-surface text-ink border-2 border-divider rounded-token-full font-semibold text-sm transition-all duration-token-default hover:bg-surface-subtle hover:border-divider-strong shadow-input-rest hover:shadow-card-hover"
            >
              {{ cancelText }}
            </button>
            <button
              @click="handleConfirm"
              :class="[
                'inline-flex items-center px-5 py-2.5 rounded-token-full font-semibold text-sm transition-all duration-token-default shadow-card-rest hover:shadow-card-hover focus:ring-4 focus:outline-none border-2',
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
.modal-enter-active,
.modal-leave-active {
  transition: opacity 250ms cubic-bezier(0, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.modal-enter-from > div {
  transform: scale(0.95) translateY(-10px);
}

.modal-leave-to > div {
  transform: scale(0.95) translateY(10px);
}
</style>
