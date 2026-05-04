<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
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
  rows: {
    type: Number,
    default: 4
  },
  resize: {
    type: String,
    default: 'vertical'
  },
  variant: {
    type: String,
    default: 'default'
  },
  maxlength: {
    type: Number,
    default: null
  },
  showCount: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input']);
const textareaRef = ref(null);

const uiVariant = computed(() => {
  if (props.variant === 'filled') return 'none';
  return 'outline';
});

const characterCount = computed(() => props.modelValue?.length || 0);
const isOverLimit = computed(() => props.maxlength && characterCount.value > props.maxlength);

const autoresize = computed(() => ['vertical', 'both'].includes(props.resize));

const focus = () => {
  if (textareaRef.value?.textarea) {
    textareaRef.value.textarea.focus();
  }
};

defineExpose({
  focus,
  blur: () => textareaRef.value?.textarea?.blur(),
  select: () => textareaRef.value?.textarea?.select()
});
</script>

<template>
  <UFormField
    :label="label"
    :error="error"
    :required="required"
    class="w-full"
  >
    <UTextarea
      ref="textareaRef"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :rows="rows"
      :autoresize="autoresize"
      :resize="resize !== 'none'"
      :variant="uiVariant"
      :maxlength="maxlength"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
      @input="$emit('input', $event)"
      @keydown.space.stop
    />

    <!-- Character Count -->
    <div v-if="showCount || maxlength" class="flex justify-end mt-1">
      <div :class="['text-xs', isOverLimit ? 'text-red-600' : 'text-gray-500']">
        <span v-if="showCount">{{ characterCount }}</span>
        <span v-if="maxlength">{{ showCount ? '/' : '' }}{{ maxlength }}</span>
      </div>
    </div>

    <template #help v-if="$slots.help">
      <slot name="help"></slot>
    </template>
  </UFormField>
</template>