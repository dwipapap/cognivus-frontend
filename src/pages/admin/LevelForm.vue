<template>
  <form @submit.prevent="handleSave" class="p-1">
    <div class="flex flex-col lg:flex-row gap-10">
      <div class="lg:w-[40%] bg-slate-900 rounded-xl p-10 text-white flex flex-col justify-between min-h-[400px]">
        <div>
          <div class="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mb-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 class="text-4xl font-bold mb-6 tracking-tight leading-tight">
            {{ isEditMode ? 'Modify Level' : 'Define Level' }}
          </h2>
          <p class="text-slate-300 text-lg leading-relaxed">
            Create a structured hierarchy for your curriculum. Levels help students navigate their learning journey effectively.
          </p>
        </div>

        <div class="mt-12 space-y-4">
          <div class="flex items-center gap-3 bg-slate-800 rounded-xl p-4">
            <div class="w-2 h-2 rounded-full bg-slate-400"></div>
            <span class="text-sm font-semibold uppercase tracking-wider">Proficiency Tracking</span>
          </div>
          <div class="flex items-center gap-3 bg-slate-800 rounded-xl p-4">
            <div class="w-2 h-2 rounded-full bg-slate-400"></div>
            <span class="text-sm font-semibold uppercase tracking-wider">Clear Milestones</span>
          </div>
        </div>
      </div>

      <div class="lg:w-[60%] flex flex-col justify-between py-4">
        <div class="space-y-8">
          <div>
            <BaseInput
              v-bind="getFieldProps('name')"
              label="Level Name"
              required
              placeholder="e.g. Intermediate, Advanced Master"
              variant="outline"
              size="lg"
            />
            <p class="mt-2 text-xs text-slate-500 pl-1">Use a descriptive name that clearly communicates the difficulty level.</p>
          </div>

          <div>
            <BaseTextarea
              v-bind="getFieldProps('description')"
              label="Description"
              :rows="6"
              placeholder="Provide a detailed summary of what this level entails, goals, and prerequisites..."
              variant="outline"
            />
            <p class="mt-2 text-xs text-slate-500 pl-1">Detailed descriptions help students understand the value of this milestone.</p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-5 mt-12 pt-8 border-t border-slate-200">
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
            size="lg"
            :loading="isSubmitting"
          >
            {{ isEditMode ? 'Update Level' : 'Save Level' }}
          </BaseButton>
        </div>
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
    // Explicitly reset to initial values in create mode
    formData.name = '';
    formData.description = '';
  }
}, { immediate: true });

/** Submit form data */
const handleSave = async () => {
  await submit(async (data) => {
    // Only send name and description, never send levelid
    const cleanData = {
      name: data.name,
      description: data.description || ''
    };
    emit('submit', cleanData);
  });
};
</script>
