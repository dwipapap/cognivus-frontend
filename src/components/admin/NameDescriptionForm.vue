<template>
  <form :id="formId" @submit.prevent="handleSave" class="space-y-6">
    <div v-if="hasErrors" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <p class="font-medium mb-1">Please fix the following errors:</p>
      <ul class="list-disc list-inside space-y-1">
        <li v-for="(err, field) in errors" :key="field" class="text-red-700">{{ field }}: {{ err }}</li>
      </ul>
    </div>
    <div>
      <h3 class="text-sm font-semibold text-default flex items-center gap-2">
        <UIcon :name="icon" class="w-4 h-4 text-toned" />
        {{ label }} Details
      </h3>
      <p class="text-xs text-muted mt-1">{{ hint }}</p>
    </div>

    <UFormField :label="`${label} Name`" required :description="nameHint">
      <UInput v-bind="getFieldProps('name')" :placeholder="namePlaceholder" class="w-full" />
    </UFormField>

    <UFormField :label="descriptionLabel" :description="descriptionHint">
      <UTextarea v-bind="getFieldProps('description')" :rows="rows" :placeholder="descriptionPlaceholder" class="w-full" />
    </UFormField>
  </form>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useForm } from '../../composables/useForm';

// ponytail: shared by the ManageLevels/ManagePrograms slideovers.
// Both entities are {name, description}; only copy differs. Add props here only if a
// third entity needs a genuinely different field, otherwise make a new component.
const props = defineProps({
  /** Entity data for edit mode; null clears the form */
  model: { type: Object, default: null },
  /** Entity name, e.g. "Level". Drives the form id, heading, and name label. */
  label: { type: String, required: true },
  icon: { type: String, required: true },
  hint: { type: String, default: '' },
  nameHint: { type: String, default: '' },
  namePlaceholder: { type: String, default: '' },
  descriptionLabel: { type: String, default: 'Description' },
  descriptionHint: { type: String, default: '' },
  descriptionPlaceholder: { type: String, default: 'Optional' },
  rows: { type: Number, default: 4 }
});

const emit = defineEmits(['submit']);

const formId = computed(() => `${props.label.toLowerCase()}-form`);

const { formData, errors, isSubmitting, hasErrors, submit, getFieldProps, reset } = useForm(
  {
    name: '',
    description: ''
  },
  {
    name: ['required']
  }
);

defineExpose({ isSubmitting });

watch(() => props.model, (next) => {
  if (next) {
    formData.name = next.name || '';
    formData.description = next.description || '';
  } else {
    reset();
  }
}, { immediate: true });

const handleSave = async () => {
  await submit(async (data) => {
    emit('submit', { name: data.name, description: data.description || '' });
  });
};
</script>
