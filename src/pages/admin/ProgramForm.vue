<template>
  <form @submit.prevent="handleSave" class="relative">
    <div class="space-y-6">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
          <IconProgram class="w-5 h-5" />
        </div>
        <div>
          <h4 class="text-sm font-semibold text-slate-900 uppercase tracking-wider">Program Details</h4>
          <p class="text-xs text-slate-500">Define the core identity of this academic program</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 bg-white p-6 rounded-lg border border-slate-200">
        <div>
          <BaseInput
            v-bind="getFieldProps('name')"
            label="Program Name"
            required
            placeholder="e.g., Intensive English, Regular Academic"
            variant="outline"
          >
            <template #icon>
              <IconEdit class="w-4 h-4 text-slate-400" />
            </template>
          </BaseInput>
        </div>

        <div>
          <BaseTextarea
            v-bind="getFieldProps('description')"
            label="Program Description"
            :rows="4"
            placeholder="Briefly describe the program's objectives and curriculum structure..."
            variant="outline"
          />
        </div>
      </div>

      <div class="bg-slate-50 rounded-lg p-4 flex items-start gap-3 border border-slate-200">
        <IconInfo class="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
        <p class="text-xs text-slate-600 leading-relaxed">
          Ensure the program name is unique and descriptive. This information will be visible to students during enrollment.
        </p>
      </div>

      <div class="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
        <BaseButton 
          type="button" 
          variant="secondary" 
          @click="$emit('cancel')"
        >
          Cancel
        </BaseButton>
        <BaseButton 
          type="submit" 
          variant="primary" 
          :loading="isSubmitting"
        >
          <template #icon v-if="!isSubmitting">
            <IconSave class="w-4 h-4" />
          </template>
          {{ isEditMode ? 'Update Program' : 'Create Program' }}
        </BaseButton>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useForm } from '../../composables/useForm';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseTextarea from '../../components/form/BaseTextarea.vue';

// Icons
import IconProgram from '~icons/solar/folder-with-files-bold-duotone';
import IconEdit from '~icons/solar/pen-new-square-linear';
import IconSave from '~icons/solar/check-read-linear';
import IconInfo from '~icons/solar/info-circle-linear';

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

/** Populate form when editing */
watch(() => props.program, (newProgram) => {
  if (newProgram) {
    formData.name = newProgram.name || '';
    formData.description = newProgram.description || '';
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
