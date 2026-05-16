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
  },
  confirmLabel: {
    type: String,
    default: 'OK'
  },
  cancelLabel: {
    type: String,
    default: 'Cancel'
  },
  showCancel: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'confirm', 'cancel', 'update:show']);

const modalRef = ref(null);
const contentRef = ref(null);
const confirmButtonRef = ref(null);
let previousFocus = null;
let scrollPosition = 0;

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

const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const getFocusableElements = () => {
  if (!modalRef.value) return [];
  return Array.from(modalRef.value.querySelectorAll(focusableSelectors)).filter(
    (el) => !el.disabled && el.offsetParent !== null
  );
};

const trapFocus = (event) => {
  const focusable = getFocusableElements();
  if (focusable.length === 0) return;

  const firstFocusable = focusable[0];
  const lastFocusable = focusable[focusable.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
    }
  } else {
    if (document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  }
};

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

const handleCancel = () => {
  emit('cancel');
  if (!props.persistent) {
    emit('close');
    emit('update:show', false);
  }
};

const handleKeydown = (event) => {
  if (!props.show) return;

  if (event.key === 'Escape' && !props.persistent) {
    event.preventDefault();
    emit('update:show', false);
    return;
  }

  if (event.key === 'Tab') {
    trapFocus(event);
  }
};

const restoreFocus = () => {
  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus();
  }
  previousFocus = null;
};

const lockBodyScroll = () => {
  scrollPosition = window.scrollY || window.pageYOffset;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.width = '100%';
};

const unlockBodyScroll = () => {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, scrollPosition);
  scrollPosition = 0;
};

watch(() => props.show, async (newValue) => {
  if (newValue) {
    previousFocus = document.activeElement;
    lockBodyScroll();
    await nextTick();
    if (confirmButtonRef.value) {
      confirmButtonRef.value.focus();
    } else if (modalRef.value) {
      modalRef.value.focus();
    }
  } else {
    unlockBodyScroll();
    restoreFocus();
  }
});

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  if (props.show) {
    unlockBodyScroll();
    restoreFocus();
  }
});
</script>

<template>
  <Teleport to="body">
    <transition name="modal" appear>
      <div
        v-if="show"
        class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay overflow-y-auto"
        :class="size === 'fullscreen' ? 'p-0 sm:p-2' : 'p-3 sm:p-4'"
        style="padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right); padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);"
        @click.self="handleBackdropClick"
      >
        <div
          ref="modalRef"
          :class="[
            'modal-panel relative w-full rounded-token-3xl shadow-modal-overlay overflow-hidden flex flex-col bg-surface',
            size === 'fullscreen' ? 'h-screen sm:h-[96vh] my-0 sm:my-2' : 'my-4 sm:my-8 max-h-[calc(100vh-2rem)] sm:max-h-[90vh]',
            sizeClass
          ]"
          tabindex="-1"
          role="dialog"
          aria-labelledby="modal-title"
          :aria-describedby="contentRef ? 'modal-description' : undefined"
          aria-modal="true"
        >
          <div
            class="flex items-start justify-between p-4 sm:p-6 border-b border-divider"
          >
            <div class="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div class="flex-shrink-0">
                <div :class="['flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-token-full', iconClass]">
                  <slot name="icon">
                    <svg v-if="type === 'success'" class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>

                    <svg v-else-if="type === 'error'" class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>

                    <svg v-else-if="type === 'warning'" class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>

                    <svg v-else class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </slot>
                </div>
              </div>

              <h3 id="modal-title" class="text-base sm:text-lg font-semibold text-ink truncate">
                {{ modalTitle }}
              </h3>
            </div>

            <button
              v-if="!persistent"
              @click="handleClose"
              type="button"
              class="text-ink-muted bg-transparent hover:bg-surface-subtle hover:text-ink active:bg-surface-subtle active:scale-95 rounded-token-lg text-sm min-w-[44px] min-h-[44px] ml-auto inline-flex justify-center items-center transition-all duration-token-default"
              :aria-label="cancelLabel || 'Close modal'"
            >
              <svg class="w-5 h-5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 14 14" aria-hidden="true">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
            </button>
          </div>

          <div
            ref="contentRef"
            id="modal-description"
            :class="[
              'overflow-y-auto break-words',
              size === 'fullscreen' ? 'flex-1 p-0' : 'p-4 sm:p-6 md:p-8',
              size === 'fullscreen' ? 'flex-1' : 'max-h-[60vh]'
            ]"
          >
            <slot name="content">
              <p v-if="message" class="text-sm sm:text-base text-ink-muted">
                {{ message }}
              </p>
              <p v-else class="text-sm sm:text-base text-ink-muted italic">
                No content provided.
              </p>
            </slot>
          </div>

          <div
            v-if="!hideFooter"
            class="flex flex-wrap justify-end gap-2 sm:gap-3 p-4 sm:px-6 sm:py-5 md:px-8 md:py-5 border-t border-divider"
          >
            <slot name="footer">
              <template v-if="showCancel">
                <button
                  @click="handleCancel"
                  type="button"
                  class="font-medium rounded-token-full text-sm px-5 py-2.5 min-h-[44px] text-center focus:ring-4 focus:outline-none transition-all duration-token-default active:scale-95 text-ink-muted bg-surface-subtle hover:bg-surface hover:text-ink focus:ring-divider"
                >
                  {{ cancelLabel }}
                </button>
              </template>
              <button
                ref="confirmButtonRef"
                @click="handleConfirm"
                type="button"
                :class="[
                  'font-medium rounded-token-full text-sm px-5 py-2.5 min-h-[44px] text-center focus:ring-4 focus:outline-none transition-all duration-token-default active:scale-95',
                  buttonClass
                ]"
              >
                {{ confirmLabel }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  --modal-easing: cubic-bezier(0, 0, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  .modal-backdrop {
    --modal-easing: linear;
  }
}

@media (max-height: 500px) and (orientation: landscape) {
  .modal-backdrop {
    align-items: flex-start;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .modal-panel {
    max-height: calc(100vh - 2rem);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 250ms var(--modal-easing);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform 250ms var(--modal-easing);
}

.modal-enter-from .modal-panel {
  transform: scale(0.95) translateY(-10px);
}

.modal-leave-to .modal-panel {
  transform: scale(0.95) translateY(10px);
}

.modal-panel :deep(button:focus-visible) {
  outline: 2px solid rgba(37, 99, 235, 0.5);
  outline-offset: 2px;
}

.modal-panel :deep(.overflow-y-auto) {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.modal-panel :deep(.overflow-y-auto::-webkit-scrollbar) {
  width: 6px;
}

.modal-panel :deep(.overflow-y-auto::-webkit-scrollbar-track) {
  background: transparent;
}

.modal-panel :deep(.overflow-y-auto::-webkit-scrollbar-thumb) {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.modal-panel :deep(.overflow-y-auto::-webkit-scrollbar-thumb:hover) {
  background-color: rgba(107, 114, 128, 0.7);
}
</style>
