<template>
  <UModal
    :open="show"
    @update:open="$emit('close')"
    :persistent="persistent"
    :title="modalTitle"
    :description="message"
  >
    <template #body>
      <div v-if="!$slots.content" class="py-4">
        <div class="flex items-start gap-4">
          <div :class="['w-12 h-12 rounded-full flex items-center justify-center shrink-0', iconBg]">
            <UIcon :name="iconName" :class="['w-6 h-6', iconColor]" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ modalTitle }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ message }}</p>
          </div>
        </div>
      </div>
      <slot name="content" v-else></slot>
    </template>

    <template #footer>
      <slot name="footer">
        <UButton :color="buttonColor" @click="$emit('close')">OK</UButton>
      </slot>
    </template>
  </UModal>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info'
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
    default: 'md'
  }
});

const emit = defineEmits(['close', 'confirm']);

const modalTitle = computed(() => {
  if (props.title) return props.title;
  const defaults = { success: 'Success!', error: 'Error!', info: 'Information', warning: 'Warning!' };
  return defaults[props.type];
});

const iconName = computed(() => {
  switch (props.type) {
    case 'success': return 'i-basil-check-solid';
    case 'error': return 'i-basil-cross-solid';
    case 'warning': return 'i-basil-info-triangle-outline';
    default: return 'i-basil-info-circle-outline';
  }
});

const iconColor = computed(() => {
  switch (props.type) {
    case 'success': return 'text-green-600';
    case 'error': return 'text-red-600';
    case 'warning': return 'text-yellow-600';
    default: return 'text-blue-600';
  }
});

const iconBg = computed(() => {
  switch (props.type) {
    case 'success': return 'bg-green-100';
    case 'error': return 'bg-red-100';
    case 'warning': return 'bg-yellow-100';
    default: return 'bg-blue-100';
  }
});

const buttonColor = computed(() => {
  switch (props.type) {
    case 'success': return 'green';
    case 'error': return 'red';
    case 'warning': return 'yellow';
    default: return 'blue';
  }
});
</script>


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