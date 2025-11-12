<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
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
            <!-- Username (Create only or Edit mode) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Username {{ !isEditMode ? '*' : '' }}
              </label>
              <input
                v-model="formData.username"
                type="text"
                :required="!isEditMode"
                :placeholder="isEditMode ? 'Leave blank to keep current username' : 'Enter username'"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p v-if="isEditMode" class="mt-1 text-xs text-gray-500">Leave blank to keep existing username</p>
            </div>

            <!-- Email (Create only or Edit mode) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email {{ !isEditMode ? '*' : '' }}
              </label>
              <input
                v-model="formData.email"
                type="email"
                :required="!isEditMode"
                :placeholder="isEditMode ? 'Leave blank to keep current email' : 'Enter email'"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p v-if="isEditMode" class="mt-1 text-xs text-gray-500">Leave blank to keep existing email</p>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Password {{ !isEditMode ? '*' : '' }}
              </label>
              <input
                v-model="formData.password"
                type="password"
                :required="!isEditMode"
                :placeholder="isEditMode ? 'Leave blank to keep current password' : 'Enter password'"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p v-if="isEditMode" class="mt-1 text-xs text-gray-500">Leave blank to keep existing password</p>
            </div>
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
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                v-model="formData.fullname"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full name"
              />
            </div>

            <!-- Gender -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select
                v-model="formData.gender"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <!-- Birth Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
              <input
                v-model="formData.birthdate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Birth Place -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Birth Place</label>
              <input
                v-model="formData.birthplace"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter birth place"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Contact & Class Info -->
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
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            <!-- Address -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                v-model="formData.address"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter address"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Parent Information Section -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            Parent Information
          </h3>
          
          <div class="space-y-4">
            <!-- Parent Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
              <input
                v-model="formData.parentname"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter parent name"
              />
            </div>

            <!-- Parent Phone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
              <input
                v-model="formData.parentphone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter parent phone"
              />
            </div>
          </div>
        </div>

        <!-- Class & Payment Section -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Class & Payment
          </h3>
          
          <div class="space-y-4">
            <!-- Class Assignment -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                v-model="formData.classid"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option :value="null">No class assigned</option>
                <option v-for="cls in classes" :key="cls.classid" :value="cls.classid">
                  {{ cls.class_code }} - {{ cls.level?.level_name || 'Unknown Level' }}
                </option>
              </select>
            </div>

            <!-- Payment Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
              <select
                v-model="formData.payment_type"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select payment type</option>
                <option value="Monthly">Monthly</option>
                <option value="Full">Full Payment</option>
              </select>
            </div>
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
              <span>Username and email are required for new students</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Leave password blank when editing to keep existing password</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Class assignment can be set later if not available now</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Parent information is optional but recommended</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
      <BaseButton type="button" variant="secondary" @click="$emit('cancel')">
        Cancel
      </BaseButton>
      <BaseButton type="submit" variant="primary">
        <template #icon>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </template>
        {{ isEditMode ? 'Update Student' : 'Create Student' }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';
import BaseButton from '../../components/ui/BaseButton.vue';

const props = defineProps({
  /** Student data for edit mode */
  student: { type: Object, default: null },
  /** Available classes for dropdown */
  classes: { type: Array, default: () => [] },
  /** Edit or create mode */
  isEditMode: { type: Boolean, default: false }
});

const emit = defineEmits(['submit', 'cancel']);

const formData = ref({
  username: '',
  email: '',
  password: '',
  fullname: '',
  gender: '',
  birthdate: '',
  birthplace: '',
  phone: '',
  address: '',
  parentname: '',
  parentphone: '',
  classid: null,
  payment_type: ''
});

/** Populate form when editing */
watch(() => props.student, (newStudent) => {
  if (newStudent) {
    formData.value = {
      username: '',
      email: '',
      password: '',
      fullname: newStudent.fullname || '',
      gender: newStudent.gender || '',
      birthdate: newStudent.birthdate || '',
      birthplace: newStudent.birthplace || '',
      phone: newStudent.phone || '',
      address: newStudent.address || '',
      parentname: newStudent.parentname || '',
      parentphone: newStudent.parentphone || '',
      classid: newStudent.classid || null,
      payment_type: newStudent.payment_type || ''
    };
  } else {
    // Reset form for create mode
    formData.value = {
      username: '',
      email: '',
      password: '',
      fullname: '',
      gender: '',
      birthdate: '',
      birthplace: '',
      phone: '',
      address: '',
      parentname: '',
      parentphone: '',
      classid: null,
      payment_type: ''
    };
  }
}, { immediate: true });

/** Submit form data */
const handleSubmit = () => {
  emit('submit', formData.value);
};
</script>
