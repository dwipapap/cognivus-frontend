<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue';

// Props definition with proper validation
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
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'gradient'].includes(value)
  },
  gradientFrom: {
    type: String,
    default: 'blue-500'
  },
  gradientVia: {
    type: String,
    default: 'blue-600'
  },
  gradientTo: {
    type: String,
    default: 'indigo-600'
  },
  iconComponent: {
    type: String,
    default: ''
  },
  hideFooter: {
    type: Boolean,
    default: false
  }
});

// Emits definition
const emit = defineEmits(['close', 'confirm']);

// Refs
const modalRef = ref(null);

// Computed properties
const iconClass = computed(() => {
  const classes = {
    success: 'text-green-600 bg-green-100',
    error: 'text-red-600 bg-red-100',
    info: 'text-blue-600 bg-blue-100',
    warning: 'text-yellow-600 bg-yellow-100'
  };
  return classes[props.type];
});

const modalTitle = computed(() => {
  if (props.title) return props.title;
  
  const defaultTitles = {
    success: 'Success!',
    error: 'Error!',
    info: 'Information',
    warning: 'Warning!'
  };
  return defaultTitles[props.type];
});

const buttonClass = computed(() => {
  const classes = {
    success: 'text-white bg-green-700 hover:bg-green-800 focus:ring-green-300',
    error: 'text-white bg-red-700 hover:bg-red-800 focus:ring-red-300',
    info: 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300',
    warning: 'text-white bg-yellow-700 hover:bg-yellow-800 focus:ring-yellow-300'
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

const gradientClass = computed(() => {
  if (props.variant !== 'gradient') return '';
  return `bg-gradient-to-r from-${props.gradientFrom} via-${props.gradientVia} to-${props.gradientTo}`;
});

const isGradientVariant = computed(() => props.variant === 'gradient');

// Methods
const handleClose = () => {
  if (!props.persistent) {
    emit('close');
  }
};

const handleBackdropClick = () => {
  if (!props.persistent) {
    emit('close');
  }
};

const handleConfirm = () => {
  emit('confirm');
};

// Handle escape key
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.show) {
    emit('update:show', false);
  }
};

// Setup event listener once on mount
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

// Cleanup event listener on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// Watch the `show` prop to focus the modal when it opens
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
        class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto"
        :class="size === 'fullscreen' ? 'p-2' : 'p-4'"
        @click.self="handleBackdropClick"
      >
        <!-- Modal content -->
        <div
          ref="modalRef"
          :class="[
            'modal-content relative w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col',
            isGradientVariant ? 'bg-white max-h-[90vh]' : 'bg-white bg-opacity-90 backdrop-blur-lg border border-white border-opacity-20',
            size === 'fullscreen' ? 'h-[96vh] my-2' : 'my-8 max-h-[90vh]',
            sizeClass
          ]"
          tabindex="-1"
          role="dialog"
          :aria-labelledby="modalTitle"
          aria-modal="true"
        >
          <!-- Gradient Header -->
          <div
            v-if="isGradientVariant"
            :class="[
              'sticky top-0 px-4 py-3 flex justify-between items-center shadow-lg',
              gradientClass
            ]"
          >
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <slot name="icon">
                  <!-- Default gradient icon based on type -->
                  <svg v-if="type === 'success'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else-if="type === 'error'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <svg v-else-if="type === 'warning'" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <svg v-else class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </slot>
              </div>
              <h3 class="text-lg font-bold text-white">
                {{ modalTitle }}
              </h3>
            </div>
            <button
              v-if="!persistent"
              @click="handleClose"
              class="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-all hover:scale-110 active:scale-95"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Default Header -->
          <div
            v-else
            class="flex items-start justify-between p-6 border-b border-gray-200 border-opacity-30 rounded-t"
          >
            <div class="flex items-center space-x-3">
              <!-- Dynamic Icon -->
              <div class="flex-shrink-0">
                <div :class="['flex items-center justify-center w-10 h-10 bg-opacity-80 rounded-full', iconClass]">
                  <slot name="icon">
                    <!-- Success Icon -->
                    <svg v-if="type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    
                    <!-- Error Icon -->
                    <svg v-else-if="type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    
                    <!-- Warning Icon -->
                    <svg v-else-if="type === 'warning'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    
                    <!-- Info Icon -->
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </slot>
                </div>
              </div>
              
              <h3 class="text-lg font-semibold text-gray-900">
                {{ modalTitle }}
              </h3>
            </div>
            
            <button
              v-if="!persistent"
              @click="handleClose"
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:bg-opacity-50 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center transition-all duration-200"
              aria-label="Close modal"
            >
              <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
            </button>
          </div>
          
          <!-- Modal body -->
          <div 
            :class="[
              'overflow-y-auto',
              size === 'fullscreen' ? 'flex-1 p-0' : 'p-6 sm:p-8',
              isGradientVariant ? 'flex-1 bg-gradient-to-b from-gray-50/50 to-white' : size === 'fullscreen' ? 'flex-1' : 'max-h-[60vh]'
            ]"
          >
            <slot name="content">
              <p class="text-base text-gray-700">
                {{ message }}
              </p>
            </slot>
          </div>
          
          <!-- Modal footer - only show if not hidden and has content -->
          <div 
            v-if="!hideFooter && ($slots.footer || message || type)"
            :class="[
              'flex justify-end space-x-3 p-6 sm:px-8 sm:py-5',
              isGradientVariant ? 'sticky bottom-0 bg-white border-t border-gray-200 shadow-lg' : 'border-t border-gray-200 border-opacity-30 rounded-b'
            ]"
          >
            <slot name="footer">
              <button
                @click="handleClose"
                type="button"
                :class="[
                  'font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none transition-colors',
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
/* Vue Transition Classes for Modal */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

/* Content animations */
.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .modal-content {
  transform: scale(0.9) translateY(-20px);
}

.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(10px);
}

/* Additional smooth transitions for interactive elements */
.modal-content button {
  transition: all 0.2s ease-in-out;
}

/* Focus states for accessibility */
.modal-content button:focus {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

/* Smooth scrolling for modal body */
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