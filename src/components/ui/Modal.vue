<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'info', 'warning'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  persistent: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'fullscreen'].includes(value)
  },
  hideFooter: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'confirm', 'update:show']);

const modalRef = ref(null);

const iconClass = computed(() => {
  const classes = {
    success: 'text-brand-success bg-brand-success/10',
    error: 'text-brand-danger bg-brand-danger/10',
    info: 'text-brand-primary bg-brand-primary/10',
    warning: 'text-brand-warning bg-brand-warning/10'
  };
  return classes[props.type];
});

const modalTitle = computed(() => {
  if (props.title) return props.title;

  const defaultTitles = {
    success: 'Success',
    error: 'Error',
    info: 'Information',
    warning: 'Warning'
  };
  return defaultTitles[props.type];
});

const buttonClass = computed(() => {
  const classes = {
    success: 'text-white bg-brand-success hover:bg-brand-success-hover focus:ring-brand-success-ring',
    error: 'text-white bg-brand-danger hover:bg-brand-danger-hover focus:ring-brand-danger-ring',
    info: 'text-white bg-brand-primary hover:bg-brand-primary-hover focus:ring-brand-primary-ring',
    warning: 'text-white bg-brand-warning hover:bg-brand-warning-hover focus:ring-brand-warning-ring'
  };
  return classes[props.type];
});

const sizeClass = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'fullscreen': 'w-[95vw]'
  };
  return sizes[props.size];
});

const handleClose = () => {
  if (!props.persistent) {
    emit('close');
    emit('update:show', false);
  }
};

const handleBackdropClick = () => {
  if (!props.persistent) {
    emit('close');
    emit('update:show', false);
  }
};

const handleConfirm = () => {
  emit('confirm');
};

const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.show) {
    emit('update:show', false);
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
    <transition name="modal" appear>
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay overflow-y-auto"
        :class="size === 'fullscreen' ? 'p-2' : 'p-4'"
        @click.self="handleBackdropClick"
      >
        <div
          ref="modalRef"
          :class="[
            'relative w-full rounded-token-3xl shadow-modal-overlay overflow-hidden flex flex-col bg-surface',
            size === 'fullscreen' ? 'h-[96vh] my-2' : 'my-8 max-h-[90vh]',
            sizeClass
          ]"
          tabindex="-1"
          role="dialog"
          :aria-labelledby="modalTitle"
          aria-modal="true"
        >
          <div
            class="flex items-start justify-between p-6 border-b border-divider"
          >
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div :class="['flex items-center justify-center w-10 h-10 rounded-token-full', iconClass]">
                  <slot name="icon">
                    <svg v-if="type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>

                    <svg v-else-if="type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>

                    <svg v-else-if="type === 'warning'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>

                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </slot>
                </div>
              </div>

              <h3 class="text-lg font-semibold text-ink">
                {{ modalTitle }}
              </h3>
            </div>

            <button
              v-if="!persistent"
              @click="handleClose"
              type="button"
              class="text-ink-muted bg-transparent hover:bg-surface-subtle hover:text-ink rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center transition-all duration-token-default"
              aria-label="Close modal"
            >
              <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
            </button>
          </div>

          <div
            :class="[
              'overflow-y-auto',
              size === 'fullscreen' ? 'flex-1 p-0' : 'p-6 sm:p-8',
              size === 'fullscreen' ? 'flex-1' : 'max-h-[60vh]'
            ]"
          >
            <slot name="content">
              <p class="text-base text-gray-700">
                {{ message }}
              </p>
            </slot>
          </div>

          <div
            v-if="!hideFooter && ($slots.footer || message || type)"
            class="flex justify-end space-x-3 p-6 sm:px-8 sm:py-5 border-t border-divider"
          >
            <slot name="footer">
              <button
                @click="handleClose"
                type="button"
                :class="[
                  'font-medium rounded-token-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none transition-colors duration-token-default',
                  buttonClass
                ]"
              >
                OK
              </button>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 250ms cubic-bezier(0, 0, 0.2, 1);
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.modal-enter-from .relative {
  transform: scale(0.95) translateY(-10px);
}

.modal-leave-to .relative {
  transform: scale(0.95) translateY(10px);
}

.modal-content button:focus {
  outline: 2px solid rgba(37, 99, 235, 0.5);
  outline-offset: 2px;
}

.modal-content > div {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.modal-content > div::-webkit-scrollbar {
  width: 6px;
}

.modal-content > div::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content > div::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.modal-content > div::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.7);
}
</style>
