<template>
  <UCard
    :class="[cardClasses, 'overflow-hidden relative']"
    @click="handleClick"
  >
    <template v-if="hasHeader" #header>
      <div class="flex items-center justify-between">
        <slot name="title">
          <slot name="header"></slot>
        </slot>
        <div v-if="slots.actions" class="flex items-center space-x-2">
          <slot name="actions"></slot>
        </div>
      </div>
    </template>

    <div v-if="loading" class="absolute inset-0 bg-white/75 flex items-center justify-center z-10">
      <UIcon name="i-svg-spinners-pulse-rings-multiple" class="w-8 h-8 text-blue-600" />
    </div>

    <slot></slot>

    <template v-if="hasFooter" #footer>
      <slot name="footer"></slot>
    </template>
  </UCard>
</template>

<script setup>
import { computed, useSlots } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'default'
  },
  size: {
    type: String,
    default: 'md'
  },
  rounded: {
    type: String,
    default: 'lg'
  },
  clickable: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);
const slots = useSlots();

const hasHeader = computed(() => !!(slots.header || slots.title || slots.actions));
const hasFooter = computed(() => !!slots.footer);

const cardClasses = computed(() => {
  return [
    props.clickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : '',
    props.disabled ? 'opacity-50 cursor-not-allowed' : ''
  ].filter(Boolean).join(' ');
});

const handleClick = (event) => {
  if (props.clickable && !props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>