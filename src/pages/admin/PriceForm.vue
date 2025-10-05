<script setup>
import { watch } from 'vue';
import { useForm } from '../../composables/useForm';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseSelect from '../../components/form/BaseSelect.vue';
import BaseButton from '../../components/ui/BaseButton.vue';

const props = defineProps({
  priceItem: {
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
  programs: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'save']);

const { formData, errors, isSubmitting, submit, getFieldProps, reset } = useForm(
  {},
  {
    levelid: [],
    programid: [],
    harga: ['required']
  }
);

/** Watch for changes to populate form */
watch(() => props.priceItem, (newVal) => {
  if (newVal) {
    formData.levelid = newVal.levelid ? Number(newVal.levelid) : '';
    formData.programid = newVal.programid ? Number(newVal.programid) : '';
    formData.harga = newVal.harga || '';
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
      {{ isEditMode ? 'Edit Price' : 'Add New Price' }}
    </h2>

    <BaseSelect v-bind="getFieldProps('levelid')" label="Level">
      <option value="">Select Level</option>
      <option v-for="level in levels" :key="level.levelid" :value="level.levelid">
        {{ level.name }}
      </option>
    </BaseSelect>

    <BaseSelect v-bind="getFieldProps('programid')" label="Program">
      <option value="">Select Program</option>
      <option v-for="program in programs" :key="program.programid" :value="program.programid">
        {{ program.name }}
      </option>
    </BaseSelect>

    <BaseInput v-bind="getFieldProps('harga')" label="Price" required placeholder="e.g., Rp 500,000" />

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
