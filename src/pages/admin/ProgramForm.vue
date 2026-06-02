<template>
  <form @submit.prevent="handleSave" class="space-y-6">
    <div>
      <h3 class="text-sm font-semibold text-default flex items-center gap-2">
        <UIcon name="i-lucide-book-marked" class="w-4 h-4 text-toned" />
        Program Details
      </h3>
      <p class="text-xs text-muted mt-1">Define the core identity of this academic program.</p>
    </div>

    <div class="bg-default p-6 rounded-lg border border-default space-y-4">
      <UFormField label="Program Name" required description="Unique, descriptive. Visible to students during enrollment.">
        <UInput v-bind="getFieldProps('name')" placeholder="e.g., Intensive English" />
      </UFormField>

      <UFormField label="Program Description">
        <UTextarea v-bind="getFieldProps('description')" :rows="4" placeholder="Program objectives and curriculum structure" />
      </UFormField>
    </div>

    <div class="flex items-center justify-end gap-3 pt-6 border-t border-default">
      <UButton type="button" color="neutral" variant="outline" @click="$emit('cancel')">
        Cancel
      </UButton>
      <UButton type="submit" color="primary" variant="solid" :loading="isSubmitting" icon="i-lucide-check">
        {{ isEditMode ? 'Update Program' : 'Create Program' }}
      </UButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useForm } from '../../composables/useForm';


const props = defineProps({
  /** Program data for edit mode */
  program: { type: Object, default: null },
  /** Edit or create mode */
  isEditMode: { type: Boolean, default: false }
});

const emit = defineEmits(['submit', 'cancel']);

const { formData, errors, isSubmitting, submit, getFieldProps, reset } = useForm(
  {
    name: '',
    description: ''
  },
  {
    name: ['required']
  }
);

watch(() => props.program, (newProgram) => {
  if (newProgram) {
    formData.name = newProgram.name || '';
    formData.description = newProgram.description || '';
  } else {
    reset();
  }
}, { immediate: true });

const handleSave = async () => {
  await submit(async (data) => {
    emit('submit', data);
  });
};
</script>
