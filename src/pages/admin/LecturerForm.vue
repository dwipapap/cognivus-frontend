<script setup>
import { ref, watch } from 'vue';
import { useForm } from '../../composables/useForm';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseTextarea from '../../components/form/BaseTextarea.vue';
import BaseButton from '../../components/ui/BaseButton.vue';

const props = defineProps({
  lecturer: {
    type: Object,
    default: null
  },
  isEditMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'save']);

const { formData, errors, isSubmitting, submit, getFieldProps, reset } = useForm(
  {},
  {
    username: ['required'],
    email: ['required', 'email'],
    password: props.isEditMode ? [] : ['required', { type: 'minLength', min: 8 }],
    fullname: ['required'],
    phone: ['required', 'phone']
  }
);

// Watch for changes to populate form
watch(() => props.lecturer, (newVal) => {
  if (newVal) {
    formData.username = newVal.tbuser?.username || '';
    formData.email = newVal.tbuser?.email || '';
    formData.fullname = newVal.fullname || '';
    formData.birthplace = newVal.birthplace || '';
    formData.address = newVal.address || '';
    formData.phone = newVal.phone || '';
    formData.birthdate = newVal.birthdate ? newVal.birthdate.split('T')[0] : '';
    formData.lasteducation = newVal.lasteducation || '';
    formData.gender = newVal.gender || '';
    formData.password = '';
  } else {
    reset();
  }
}, { immediate: true });


const handleSave = async () => {
  await submit(async (data) => {
    const lecturerData = {};
    const userData = {};
    
    // Lecturer fields
    if (data.fullname) lecturerData.fullname = data.fullname;
    if (data.gender) lecturerData.gender = data.gender;
    if (data.address !== undefined) lecturerData.address = data.address || '';
    if (data.phone) lecturerData.phone = data.phone;
    if (data.birthdate !== undefined) lecturerData.birthdate = data.birthdate || null;
    if (data.birthplace !== undefined) lecturerData.birthplace = data.birthplace || '';
    if (data.lasteducation !== undefined) lecturerData.lasteducation = data.lasteducation || '';
    if (data.photo !== undefined) lecturerData.photo = data.photo;
    
    // User fields (for edit mode, only if provided)
    if (props.isEditMode) {
      if (data.email && data.email.trim()) userData.email = data.email;
      if (data.password && data.password.trim()) userData.password = data.password;
    } else {
      // In create mode, always send user fields
      if (data.username) lecturerData.username = data.username;
      if (data.email) lecturerData.email = data.email;
      if (data.password) lecturerData.password = data.password;
    }
    
    emit('save', { lecturerData, userData });
  });
};
</script>

<template>
  <form @submit.prevent="handleSave" class="space-y-6">
    <!-- Two Column Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Left Column: Account & Personal Info -->
      <div class="space-y-6">
        <!-- Account Details Section -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Account Details
          </h3>
          
          <div class="space-y-4">
            <!-- Username -->
            <BaseInput 
              v-bind="getFieldProps('username')" 
              label="Username" 
              :disabled="isEditMode"
              :placeholder="isEditMode ? 'Cannot change username' : 'Enter username'"
              required 
            />

            <!-- Email -->
            <BaseInput 
              v-bind="getFieldProps('email')" 
              type="email" 
              label="Email"
              :placeholder="isEditMode ? 'Leave blank to keep current email' : 'Enter email address'"
              :required="!isEditMode"
            />
            <p v-if="isEditMode" class="text-xs text-gray-500 -mt-2">Leave blank to keep existing email</p>

            <!-- Password -->
            <BaseInput
              v-bind="getFieldProps('password')"
              type="password"
              label="Password"
              :placeholder="isEditMode ? 'Leave blank to keep current password' : 'Minimum 8 characters'"
              :required="!isEditMode"
            />
            <p v-if="isEditMode" class="text-xs text-gray-500 -mt-2">Leave blank to keep existing password</p>
          </div>
        </div>

        <!-- Personal Information Section -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/>
            </svg>
            Personal Information
          </h3>
          
          <div class="space-y-4">
            <!-- Full Name -->
            <BaseInput 
              v-bind="getFieldProps('fullname')" 
              label="Full Name" 
              placeholder="Enter full name"
              required 
            />

            <!-- Gender -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                v-model="formData.gender"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <!-- Birth Date -->
            <BaseInput 
              v-bind="getFieldProps('birthdate')" 
              type="date" 
              label="Birth Date" 
            />

            <!-- Birth Place -->
            <BaseInput 
              v-bind="getFieldProps('birthplace')" 
              label="Birth Place"
              placeholder="Enter birth place"
            />
          </div>
        </div>
      </div>

      <!-- Right Column: Contact & Education Info -->
      <div class="space-y-6">
        <!-- Contact Information Section -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            Contact Information
          </h3>
          
          <div class="space-y-4">
            <!-- Phone -->
            <BaseInput 
              v-bind="getFieldProps('phone')" 
              type="tel" 
              label="Phone Number"
              placeholder="Enter phone number"
              required 
            />

            <!-- Address -->
            <BaseTextarea 
              v-bind="getFieldProps('address')" 
              label="Address"
              placeholder="Enter complete address"
              :rows="4"
            />
          </div>
        </div>

        <!-- Education Section -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6"/>
            </svg>
            Education
          </h3>
          
          <div class="space-y-4">
            <!-- Last Education -->
            <BaseInput 
              v-bind="getFieldProps('lasteducation')" 
              label="Last Education"
              placeholder="e.g., S1 Pendidikan Bahasa Inggris"
            />
          </div>
        </div>

        <!-- Quick Info Card -->
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <h4 class="text-sm font-semibold text-gray-900 mb-3">Quick Guide</h4>
          <ul class="space-y-2 text-xs text-gray-700">
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Username cannot be changed after creation</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Leave password blank when editing to keep current password</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Phone number is required for contact purposes</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Class assignment is managed in the Classes section</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
      <BaseButton type="button" variant="secondary" @click="$emit('close')">
        Cancel
      </BaseButton>
      <BaseButton type="submit" variant="primary" :loading="isSubmitting">
        <template #icon>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </template>
        {{ isEditMode ? 'Update Lecturer' : 'Create Lecturer' }}
      </BaseButton>
    </div>
  </form>
</template>