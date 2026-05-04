<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object, Array],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select an option'
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
  size: {
    type: String,
    default: 'md'
  },
  variant: {
    type: String,
    default: 'default'
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  multiple: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);
const selectRef = ref(null);

const uiSize = computed(() => props.size);
const uiVariant = computed(() => {
  if (props.variant === 'filled') return 'none';
  return 'outline';
});

const normalizedOptions = computed(() => {
  return props.options.map(option => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { [props.valueKey]: option, [props.labelKey]: option };
    }
    return option;
  });
});

const focus = () => {
  if (selectRef.value?.select) {
    selectRef.value.select.focus();
  }
};

defineExpose({
  focus,
  blur: () => selectRef.value?.select?.blur()
});
</script>

<template>
  <UFormField
    :label="label"
    :error="error"
    :required="required"
    class="w-full"
  >
    <USelect
      v-if="!multiple"
      ref="selectRef"
      :model-value="modelValue"
      @update:model-value="(val) => { emit('update:modelValue', val); emit('change', val); }"
      :options="normalizedOptions"
      :value-attribute="valueKey"
      :option-attribute="labelKey"
      :placeholder="placeholder"
      :disabled="disabled"
      :size="uiSize"
      :variant="uiVariant"
    />
    <USelectMenu
      v-else
      ref="selectRef"
      :model-value="modelValue"
      @update:model-value="(val) => { emit('update:modelValue', val); emit('change', val); }"
      :options="normalizedOptions"
      :value-attribute="valueKey"
      :option-attribute="labelKey"
      :placeholder="placeholder"
      :disabled="disabled"
      multiple
      :size="uiSize"
      :variant="uiVariant"
    />

    <template #help v-if="$slots.help">
      <slot name="help"></slot>
    </template>
  </UFormField>
</template>