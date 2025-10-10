<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Name -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Program Name *</label>
      <input
        v-model="formData.name"
        type="text"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter program name (e.g., Regular, Intensive)"
      />
    </div>

    <!-- Description -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea
        v-model="formData.description"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter program description"
      ></textarea>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4">
      <BaseButton type="button" variant="secondary" @click="$emit('cancel')">
        Cancel
      </BaseButton>
      <BaseButton type="submit" variant="primary">
        {{ isEditMode ? 'Update' : 'Create' }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';
import BaseButton from '../../components/ui/BaseButton.vue';

const props = defineProps({
  /** Program data for edit mode */
  program: { type: Object, default: null },
  /** Edit or create mode */
  isEditMode: { type: Boolean, default: false }
});

const emit = defineEmits(['submit', 'cancel']);

const formData = ref({
  name: '',
  description: ''
});

/** Populate form when editing */
watch(() => props.program, (newProgram) => {
  if (newProgram) {
    formData.value = {
      name: newProgram.name || '',
      description: newProgram.description || ''
    };
  }
}, { immediate: true });

/** Submit form data */
const handleSubmit = () => {
  emit('submit', formData.value);
};
</script>
