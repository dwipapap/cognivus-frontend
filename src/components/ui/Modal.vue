<script setup>
import { computed } from 'vue';
import { createReusableTemplate, useMediaQuery } from '@vueuse/core';

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
    default: 'md'
  },
  variant: {
    type: String,
    default: 'default'
  },
  hideFooter: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'confirm', 'update:show']);

const isDesktop = useMediaQuery('(min-width: 768px)');
const [DefineTemplate, ReuseTemplate] = createReusableTemplate();

const isOpen = computed({
  get: () => props.show,
  set: (val) => {
    emit('update:show', val);
    if (!val) emit('close');
  }
});

const handleClose = () => {
  isOpen.value = false;
};

const modalTitle = computed(() => {
  if (props.title) return props.title;
  const defaultTitles = {
    success: 'Success!',
    error: 'Error!',
    info: 'Information',
    warning: 'Warning!'
  };
  return defaultTitles[props.type] || '';
});

const buttonColor = computed(() => {
  const colors = {
    success: 'green',
    error: 'red',
    info: 'blue',
    warning: 'yellow'
  };
  return colors[props.type] || 'primary';
});
</script>

<template>
  <!-- Define the reusable card content -->
  <DefineTemplate>
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100' }" class="flex-1 flex flex-col w-full h-full">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 flex items-center gap-2">
            <svg v-if="type === 'success'" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="type === 'error'" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg v-else-if="type === 'warning'" class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <svg v-else class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ modalTitle }}
          </h3>
          <UButton v-if="!persistent" color="gray" variant="ghost" class="-my-1" @click="handleClose">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </UButton>
        </div>
      </template>

      <div class="p-2 flex-1 overflow-y-auto">
        <slot name="content">
          <p class="text-sm text-gray-600">{{ message }}</p>
        </slot>
      </div>

      <template #footer v-if="!hideFooter && ($slots.footer || message || type)">
        <div class="flex justify-end gap-3 mt-auto">
          <slot name="footer">
            <UButton :color="buttonColor" @click="handleClose" :ui="{ rounded: 'rounded-full' }">OK</UButton>
          </slot>
        </div>
      </template>
    </UCard>
  </DefineTemplate>

  <!-- Desktop: UModal -->
  <UModal v-if="isDesktop" v-model:open="isOpen" :prevent-close="persistent">
    <template #content>
      <ReuseTemplate />
    </template>
  </UModal>

  <!-- Mobile: USlideover -->
  <USlideover v-else v-model:open="isOpen" :prevent-close="persistent" side="bottom" class="h-[80vh] rounded-t-2xl overflow-hidden">
    <template #content>
      <ReuseTemplate />
    </template>
  </USlideover>
</template>