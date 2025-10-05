<script setup>
import { ref, watch } from 'vue';
import { useForm } from '../../composables/useForm';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseSelect from '../../components/form/BaseSelect.vue';
import BaseTextarea from '../../components/form/BaseTextarea.vue';
import BaseButton from '../../components/ui/BaseButton.vue';

const props = defineProps({
  classItem: {
    type: Object,
    default: null
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  levels: {
    type: Array,
    default: () => []
  },
  lecturers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'save']);

const { formData, errors, isSubmitting, submit, getFieldProps, reset } = useForm(
  {},
  {
    class_code: ['required'],
    levelid: ['required'],
    description: []
  }
);

/** Watch for changes to populate form */
watch(() => props.classItem, (newVal) => {
  if (newVal) {
    formData.class_code = newVal.class_code || '';
    formData.description = newVal.description || '';
    formData.levelid = newVal.levelid ? Number(newVal.levelid) : '';
    formData.lecturerid = newVal.lecturerid ? Number(newVal.lecturerid) : '';
  } else {
    reset();
  }
}, { immediate: true });

/** Handle form submission */
const handleSave = async () => {
  await submit(async (data) => {
    emit('save', data);
  });
};
</script>

<template>
  <form @submit.prevent="handleSave" class="space-y-4">
    <h2 class="text-xl font-bold text-white mb-4">
      {{ isEditMode ? 'Edit Class' : 'Add New Class' }}
    </h2>

    <BaseInput v-bind="getFieldProps('class_code')" label="Class Code" required />
    
    <BaseSelect v-bind="getFieldProps('levelid')" label="Level" required>
      <option value="">Select Level</option>
      <option v-for="level in levels" :key="level.levelid" :value="level.levelid">
        {{ level.name }}
      </option>
    </BaseSelect>

    <BaseSelect v-bind="getFieldProps('lecturerid')" label="Lecturer">
      <option value="">No Lecturer Assigned</option>
      <option v-for="lecturer in lecturers" :key="lecturer.lecturerid" :value="lecturer.lecturerid">
        {{ lecturer.fullname }}
      </option>
    </BaseSelect>

    <BaseTextarea v-bind="getFieldProps('description')" label="Description" :rows="3" />

    <div class="flex justify-end space-x-3 pt-4">
      <BaseButton type="button" variant="glass-secondary" @click="$emit('close')">
        Cancel
      </BaseButton>
      <BaseButton type="submit" variant="glass-primary" :loading="isSubmitting">
        Save
      </BaseButton>
    </div>
  </form>
</template>
