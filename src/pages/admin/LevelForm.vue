<template>
  <form id="level-form" @submit.prevent="handleSave" class="space-y-6">
    <div>
      <h3 class="text-sm font-semibold text-default flex items-center gap-2">
        <UIcon name="i-lucide-layers" class="w-4 h-4 text-toned" />
        Level Details
      </h3>
      <p class="text-xs text-muted mt-1">Define a milestone in the curriculum hierarchy.</p>
    </div>

    <UFormField label="Level Name" required description="Descriptive. Communicates difficulty (e.g., Intermediate, Advanced).">
      <UInput v-bind="getFieldProps('name')" placeholder="e.g., Intermediate" class="w-full" />
    </UFormField>

    <UFormField label="Description" description="Goals, prerequisites, and what this level covers.">
      <UTextarea v-bind="getFieldProps('description')" :rows="5" placeholder="Optional" class="w-full" />
    </UFormField>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useForm } from '../../composables/useForm';


const props = defineProps({
  /** Level data for edit mode */
  level: { type: Object, default: null },
  /** Edit or create mode */
  isEditMode: { type: Boolean, default: false }
});

const emit = defineEmits(['submit']);

const { formData, errors, isSubmitting, submit, getFieldProps, reset } = useForm(
  {
    name: '',
    description: ''
  },
  {
    name: ['required']
  }
);

defineExpose({ isSubmitting });

watch(() => props.level, (newLevel) => {
  if (newLevel) {
    formData.name = newLevel.name || '';
    formData.description = newLevel.description || '';
  } else {
    formData.name = '';
    formData.description = '';
  }
}, { immediate: true });

const handleSave = async () => {
  await submit(async (data) => {
    const cleanData = {
      name: data.name,
      description: data.description || ''
    };
    emit('submit', cleanData);
  });
};
</script>
