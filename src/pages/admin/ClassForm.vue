<script setup>
import { ref, watch } from 'vue';
import { useForm } from '../../composables/useForm';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseSelect from '../../components/form/BaseSelect.vue';
import BaseTextarea from '../../components/form/BaseTextarea.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import StudentTransferList from '../../components/admin/StudentTransferList.vue';

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
  },
  allStudents: {
    type: Array,
    default: () => []
  },
  allClasses: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'save', 'saveStudents']);

const activeTab = ref('details');

/** Days of the week for schedule selection */
const daysOfWeek = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' }
];

const { formData, errors, isSubmitting, submit, getFieldProps, reset } = useForm(
  {},
  {
    class_code: ['required'],
    levelid: ['required'],
    description: [],
    schedule_day: [],
    schedule_time: [],
    schedule_day_2: [],
    schedule_time_2: []
  }
);

/** Watch for changes to populate form */
watch(() => props.classItem, (newVal) => {
  if (newVal) {
    formData.class_code = newVal.class_code || '';
    formData.description = newVal.description || '';
    formData.levelid = newVal.levelid ? Number(newVal.levelid) : '';
    formData.lecturerid = newVal.lecturerid ? Number(newVal.lecturerid) : '';
    formData.schedule_day = newVal.schedule_day || '';
    formData.schedule_time = newVal.schedule_time || '';
    formData.schedule_day_2 = newVal.schedule_day_2 || '';
    formData.schedule_time_2 = newVal.schedule_time_2 || '';
  } else {
    reset();
  }
}, { immediate: true });

const handleSave = async () => {
  await submit(async (data) => {
    emit('save', data);
  });
};

const handleStudentSave = async (studentData) => {
  emit('saveStudents', studentData);
};
</script>

<template>
  <div class="space-y-6">
    <div v-if="isEditMode" class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          type="button"
          @click="activeTab = 'details'"
          :class="[
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === 'details'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span>Class Details</span>
          </div>
        </button>
        <button
          type="button"
          @click="activeTab = 'students'"
          :class="[
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === 'students'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <span>Manage Students</span>
          </div>
        </button>
      </nav>
    </div>

    <div v-show="activeTab === 'details'">
      <form @submit.prevent="handleSave" class="space-y-8">
        <!-- Two Column Grid Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Left Column: Class Information -->
          <div class="space-y-8">
            <!-- Class Details Section -->
            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div class="flex items-center gap-3 mb-6">
                <div class="p-2 bg-blue-50 rounded-lg">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-900">Class Information</h3>
              </div>
              
              <div class="space-y-5">
                <!-- Class Code -->
                <BaseInput 
                  v-bind="getFieldProps('class_code')" 
                  label="Class Code" 
                  placeholder="e.g., ENG-A1"
                  variant="default"
                  required 
                />

                <!-- Level -->
                <BaseSelect 
                  v-bind="getFieldProps('levelid')" 
                  label="Academic Level" 
                  required
                >
                  <option value="">Select Level</option>
                  <option v-for="level in levels" :key="level.levelid" :value="level.levelid">
                    {{ level.name }}
                  </option>
                </BaseSelect>
              </div>
            </div>

            <!-- Description Section -->
            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div class="flex items-center gap-3 mb-6">
                <div class="p-2 bg-blue-50 rounded-lg">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-900">Description</h3>
              </div>
              
              <BaseTextarea 
                v-bind="getFieldProps('description')" 
                label="Class Notes & Details"
                placeholder="Enter class objectives, requirements, or other notes..."
                :rows="5"
              />
            </div>
          </div>

          <!-- Right Column: Assignment & Schedule -->
          <div class="space-y-8">
            <!-- Lecturer Assignment Section -->
            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div class="flex items-center gap-3 mb-6">
                <div class="p-2 bg-blue-50 rounded-lg">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-900">Lecturer Assignment</h3>
              </div>
              
              <div class="space-y-5">
                <BaseSelect 
                  v-bind="getFieldProps('lecturerid')" 
                  label="Assigned Lecturer"
                >
                  <option value="">No Lecturer Assigned</option>
                  <option v-for="lecturer in lecturers" :key="lecturer.lecturerid" :value="lecturer.lecturerid">
                    {{ lecturer.fullname }}
                  </option>
                </BaseSelect>
                
                <div class="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <div class="text-sm text-blue-900">
                      <p class="font-bold mb-1">Assignment Information</p>
                      <p class="leading-relaxed opacity-80">You can assign a lecturer now or update it later. Only approved lecturers are shown in this list.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Class Schedule Section -->
            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div class="flex items-center gap-3 mb-6">
                <div class="p-2 bg-blue-50 rounded-lg">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-900">Class Schedule</h3>
              </div>
              
              <div class="space-y-6">
                <!-- Primary Schedule -->
                <div class="space-y-4">
                  <p class="text-xs font-bold text-blue-600 uppercase tracking-wider">Primary Session</p>
                  <div class="grid grid-cols-2 gap-4">
                    <BaseSelect 
                      v-bind="getFieldProps('schedule_day')" 
                      label="Session Day"
                    >
                      <option value="">Select Day</option>
                      <option v-for="day in daysOfWeek" :key="day.value" :value="day.value">
                        {{ day.label }}
                      </option>
                    </BaseSelect>
                    
                    <BaseInput 
                      v-bind="getFieldProps('schedule_time')" 
                      label="Start Time"
                      type="time"
                    />
                  </div>
                </div>

                <!-- Secondary Schedule -->
                <div class="space-y-4 pt-4 border-t border-gray-50">
                  <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Secondary Session (Optional)</p>
                  <div class="grid grid-cols-2 gap-4">
                    <BaseSelect 
                      v-bind="getFieldProps('schedule_day_2')" 
                      label="Session Day"
                    >
                      <option value="">Select Day</option>
                      <option v-for="day in daysOfWeek" :key="day.value" :value="day.value">
                        {{ day.label }}
                      </option>
                    </BaseSelect>
                    
                    <BaseInput 
                      v-bind="getFieldProps('schedule_time_2')" 
                      label="Start Time"
                      type="time"
                    />
                  </div>
                </div>

                <div class="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <div class="text-sm text-blue-900">
                      <p class="font-bold mb-1">Timezone Notice</p>
                      <p class="leading-relaxed opacity-80">All times are based on the server local time. Ensure to communicate this to students and lecturers.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions Footer -->
        <div class="flex justify-end gap-4 pt-8 border-t border-gray-100">
          <BaseButton 
            type="button" 
            variant="secondary" 
            @click="$emit('close')"
            class="px-8"
            rounded="full"
          >
            Cancel
          </BaseButton>
          <BaseButton 
            type="submit" 
            variant="primary" 
            :loading="isSubmitting"
            class="px-8 shadow-lg shadow-blue-200"
            rounded="full"
          >
            <template #icon>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </template>
            {{ isEditMode ? 'Update Class' : 'Create Class' }}
          </BaseButton>
        </div>
      </form>
    </div>

<div v-if="isEditMode" v-show="activeTab === 'students'">
  <StudentTransferList
    :current-class-id="classItem?.classid"
    :current-class-name="classItem?.class_code"
    :all-students="allStudents"
    :all-classes="allClasses"
    @save="handleStudentSave"
    @cancel="$emit('close')"
  />
</div>
</div>
</template>
