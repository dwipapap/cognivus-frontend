<template>
  <form @submit.prevent="handleSave" class="space-y-4">
    <!-- Name -->
    <BaseInput
      v-bind="getFieldProps('name')"
      label="Level Name"
      required
      placeholder="Enter level name (e.g., Beginner, Intermediate)"
    />

    <!-- Description -->
    <BaseTextarea
      v-bind="getFieldProps('description')"
      label="Description"
      :rows="3"
      placeholder="Enter level description"
    />

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4">
      <BaseButton type="button" variant="secondary" @click="$emit('cancel')">
        Cancel
      </BaseButton>
      <BaseButton type="submit" variant="primary" :loading="isSubmitting">
        {{ isEditMode ? 'Update' : 'Create' }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useForm } from '../../composables/useForm';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseTextarea from '../../components/form/BaseTextarea.vue';

const props = defineProps({
  /** Level data for edit mode */
  level: { type: Object, default: null },
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

/** Populate form when editing */
watch(() => props.level, (newLevel) => {
  if (newLevel) {
    formData.name = newLevel.name || '';
    formData.description = newLevel.description || '';
  } else {
    reset();
  }
}, { immediate: true });

/** Submit form data */
const handleSave = async () => {
  await submit(async (data) => {
    emit('submit', data);
  });
};
</script>
