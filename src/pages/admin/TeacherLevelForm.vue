<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Lecturer Selection -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Lecturer *</label>
      <select
        v-model="formData.lecturerid"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select lecturer</option>
        <option v-for="lecturer in lecturers" :key="lecturer.lecturerid" :value="lecturer.lecturerid">
          {{ lecturer.fullname }}
        </option>
      </select>
    </div>

    <!-- Level Selection -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Level *</label>
      <select
        v-model="formData.levelid"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select level</option>
        <option v-for="level in levels" :key="level.levelid" :value="level.levelid">
          {{ level.name }}
        </option>
      </select>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4">
      <BaseButton type="button" variant="secondary" @click="$emit('cancel')">
        Cancel
      </BaseButton>
      <BaseButton type="submit" variant="primary">
        {{ isEditMode ? 'Update' : 'Assign' }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';
import BaseButton from '../../components/ui/BaseButton.vue';

const props = defineProps({
  /** Teacher level data for edit mode */
  teacherLevel: { type: Object, default: null },
  /** Available lecturers */
  lecturers: { type: Array, default: () => [] },
  /** Available levels */
  levels: { type: Array, default: () => [] },
  /** Edit or create mode */
  isEditMode: { type: Boolean, default: false }
});

const emit = defineEmits(['submit', 'cancel']);

const formData = ref({
  lecturerid: '',
  levelid: ''
});

/** Populate form when editing */
watch(() => props.teacherLevel, (newData) => {
  if (newData) {
    formData.value = {
      lecturerid: newData.lecturerid || '',
      levelid: newData.levelid || ''
    };
  }
}, { immediate: true });

/** Submit form data */
const handleSubmit = () => {
  emit('submit', formData.value);
};
</script>
