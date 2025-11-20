<template>
  <form @submit.prevent="handleSave" class="space-y-4">
    <!-- Lecturer Selection -->
    <BaseSelect
      v-bind="getFieldProps('lecturerid')"
      label="Lecturer"
      required
      placeholder="Select lecturer"
    >
      <option v-for="lecturer in lecturers" :key="lecturer.lecturerid" :value="lecturer.lecturerid">
        {{ lecturer.fullname }}
      </option>
    </BaseSelect>

    <!-- Level Selection -->
    <BaseSelect
      v-bind="getFieldProps('levelid')"
      label="Level"
      required
      placeholder="Select level"
    >
      <option v-for="level in levels" :key="level.levelid" :value="level.levelid">
        {{ level.name }}
      </option>
    </BaseSelect>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4">
      <BaseButton type="button" variant="secondary" @click="$emit('cancel')">
        Cancel
      </BaseButton>
      <BaseButton type="submit" variant="primary" :loading="isSubmitting">
        {{ isEditMode ? 'Update' : 'Assign' }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useForm } from '../../composables/useForm';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseSelect from '../../components/form/BaseSelect.vue';

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

const { formData, errors, isSubmitting, submit, getFieldProps, reset } = useForm(
  {
    lecturerid: '',
    levelid: ''
  },
  {
    lecturerid: ['required'],
    levelid: ['required']
  }
);

/** Populate form when editing */
watch(() => props.teacherLevel, (newData) => {
  if (newData) {
    formData.lecturerid = newData.lecturerid || '';
    formData.levelid = newData.levelid || '';
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
