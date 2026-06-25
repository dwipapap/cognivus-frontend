<script setup>
import IconCheck from '~icons/basil/check-solid';

const props = defineProps({
  selected: { type: Boolean, default: false },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  variant: {
    type: String,
    default: 'regular',
    validator: (v) => ['regular', 'ancillary'].includes(v)
  },
  iconPath: { type: String, required: true },
  formatCurrency: { type: Function, required: true },
  priceLabel: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['select']);

const select = () => {
  if (!props.disabled) emit('select');
};

const iconBg = () => props.selected
  ? (props.variant === 'ancillary' ? 'bg-blue-600' : 'bg-blue-500')
  : props.disabled
    ? 'bg-gray-100'
  : (props.variant === 'ancillary' ? 'bg-slate-100' : 'bg-blue-50');

const iconColor = () => props.selected
  ? 'text-white'
  : props.disabled
    ? 'text-gray-400'
    : (props.variant === 'ancillary' ? 'text-slate-600' : 'text-blue-600');

const borderColor = () => props.selected
  ? (props.variant === 'ancillary' ? 'border-blue-600' : 'border-blue-500')
  : props.disabled
    ? 'border-gray-100'
  : 'border-gray-100 hover:border-blue-200';

const checkBg = () => props.variant === 'ancillary' ? 'bg-blue-600' : 'bg-blue-500';
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    @click="select"
    :class="[
      'payment-type-card w-full rounded-lg p-3 md:p-4 border-2 text-left transition-all duration-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      selected ? 'ring-2 ring-blue-200 shadow-lg' : (disabled ? '' : 'hover:shadow-md'),
      borderColor()
    ]"
  >
    <div class="flex items-start gap-2.5 md:gap-3">
      <div class="flex-shrink-0">
        <div class="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-lg flex items-center justify-center transition-colors" :class="iconBg()">
          <svg class="w-4 h-4 md:w-5 md:h-5" :class="iconColor()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath"></path>
          </svg>
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-bold text-gray-800">{{ name }}</h4>
        <p v-if="description" class="text-xs text-gray-500 mt-0.5">{{ description }}</p>
        <p
          class="text-base md:text-lg font-bold mt-1.5 md:mt-2"
          :class="disabled ? 'text-gray-500' : 'text-blue-600'"
        >
          {{ priceLabel || formatCurrency(price) }}
        </p>
      </div>
      <div v-if="selected" class="flex-shrink-0">
        <div class="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center" :class="checkBg()">
          <IconCheck class="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
        </div>
      </div>
    </div>
  </button>
</template>
