<template>
  <form @submit.prevent="handleSave" class="relative">
    <div class="space-y-6">
      <!-- Section Header -->
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
          <IconProgram class="w-5 h-5" />
        </div>
        <div>
          <h4 class="text-sm font-bold text-blue-900 uppercase tracking-wider">Program Details</h4>
          <p class="text-xs text-blue-500 font-medium">Define the core identity of this academic program</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 bg-white p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
        <!-- Decorative subtle pattern -->
        <div class="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-50/50 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 bg-blue-50/30 rounded-full blur-2xl pointer-events-none"></div>

        <!-- Name -->
        <div class="relative group">
          <BaseInput
            v-bind="getFieldProps('name')"
            label="Program Name"
            required
            placeholder="e.g., Intensive English, Regular Academic"
            variant="outline"
            class="transition-all duration-300 group-hover:shadow-sm"
          >
            <template #icon>
              <IconEdit class="w-4 h-4 text-blue-400" />
            </template>
          </BaseInput>
        </div>

        <!-- Description -->
        <div class="relative group">
          <BaseTextarea
            v-bind="getFieldProps('description')"
            label="Program Description"
            :rows="4"
            placeholder="Briefly describe the program's objectives and curriculum structure..."
            variant="outline"
            class="transition-all duration-300 group-hover:shadow-sm"
          />
        </div>
      </div>

      <!-- Footer Info -->
      <div class="bg-blue-50/50 rounded-xl p-4 flex items-start gap-3 border border-blue-100/50">
        <IconInfo class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <p class="text-xs text-blue-700 leading-relaxed">
          Ensure the program name is unique and descriptive. This information will be visible to students during enrollment.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-4 pt-4 border-t border-blue-50">
        <BaseButton 
          type="button" 
          variant="glass-secondary" 
          @click="$emit('cancel')"
          class="!rounded-xl font-bold uppercase tracking-tight text-xs h-11"
        >
          Cancel
        </BaseButton>
        <BaseButton 
          type="submit" 
          variant="primary" 
          :loading="isSubmitting"
          class="!rounded-xl px-8 shadow-blue-200 shadow-lg font-bold uppercase tracking-tight text-xs h-11"
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
