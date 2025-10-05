<script setup>
import { ref, computed, nextTick, watch } from 'vue';

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
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
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
    xl: 'max-w-xl'
  };
  return sizes[props.size];
});

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
  if (event.key === 'Escape' && !props.persistent) {
    emit('close');
  }
};

// Focus management
watch(() => props.show, async (newValue) => {
  if (newValue) {
    await nextTick();
    if (modalRef.value) {
      modalRef.value.focus();
    }
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }
});
</script>

<template>
  <Teleport to="body">
    <transition name="modal" appear>
      <div
        v-if="show"
        class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-lg"
        @click.self="handleBackdropClick"
      >
        <!-- Modal content -->
        <div
          ref="modalRef"
          :class="[
            'modal-content relative w-full max-h-full bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-2xl border border-white border-opacity-20',
            sizeClass
          ]"
          tabindex="-1"
          role="dialog"
          :aria-labelledby="modalTitle"
          aria-modal="true"
        >
          <!-- Modal header -->
          <div class="flex items-start justify-between p-6 border-b border-gray-200 border-opacity-30 rounded-t">
            <div class="flex items-center space-x-3">
              <!-- Dynamic Icon -->
              <div class="flex-shrink-0">
                <div :class="['flex items-center justify-center w-10 h-10 bg-opacity-80 rounded-full', iconClass]">
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
          <div class="p-6">
            <slot name="content">
              <p class="text-base text-gray-700">
                {{ message }}
              </p>
            </slot>
          </div>
          
          <!-- Modal footer -->
          <div class="flex justify-end space-x-3 p-6 border-t border-gray-200 border-opacity-30 rounded-b">
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

/* Backdrop animations */
.modal-backdrop {
  transition: all 0.3s ease-out;
}

/* Initial backdrop state for enter */
.modal-backdrop.modal-enter-from {
  opacity: 0;
  backdrop-filter: blur(0px);
}

/* Final backdrop state for leave */
.modal-backdrop.modal-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

/* Content animations */
.modal-content {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Initial content state for enter */
.modal-content.modal-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

/* Final content state for leave */
.modal-content.modal-leave-to {
  opacity: 0;
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
</style>