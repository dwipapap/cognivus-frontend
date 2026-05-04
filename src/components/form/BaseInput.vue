<script setup>
import { ref, computed, useSlots } from 'vue';

// Props definition
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
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
  icon: {
    type: String,
    default: ''
  },
  iconPosition: {
    type: String,
    default: 'left'
  }
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input']);
const inputRef = ref(null);
const slots = useSlots();

const focus = () => {
  // UInput might expose its native input
  if (inputRef.value?.input) {
    inputRef.value.input.focus();
  }
};

defineExpose({
  focus,
  blur: () => inputRef.value?.input?.blur(),
  select: () => inputRef.value?.input?.select()
});

const uiSize = computed(() => {
  return props.size;
});

const uiVariant = computed(() => {
  if (props.variant === 'filled') return 'none';
  return 'outline';
});
</script>

<template>
  <UFormField
    :label="label"
    :error="error"
    :required="required"
    class="w-full"
  >
    <UInput
      ref="inputRef"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :size="uiSize"
      :variant="uiVariant"
      :icon="icon || undefined"
      :trailing="iconPosition === 'right'"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
      @input="$emit('input', $event)"
      @keydown.space.stop
    >
      <template #leading v-if="slots.icon && iconPosition === 'left'">
        <slot name="icon"></slot>
      </template>
      <template #trailing v-if="slots.icon && iconPosition === 'right'">
        <slot name="icon"></slot>
      </template>
    </UInput>

    <template #help v-if="slots.help">
      <slot name="help"></slot>
    </template>
  </UFormField>
</template>