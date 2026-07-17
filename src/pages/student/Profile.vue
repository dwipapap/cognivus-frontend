<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { studentAPI } from '../../services/api';
import { authStore } from '../../store/auth';
import Modal from '../../components/ui/Modal.vue';
import {
  OCCUPATIONS,
  PROGRAMS,
  ENGLISH_LEVELS,
  REFERRAL_SOURCES,
  LEARNING_MODES,
  PREFERRED_TIMES,
  STUDIED_BEFORE,
  LEARNING_REASONS
} from '../../config/studentOptions';

// Gender mapping helper
const mapGenderToBackend = (frontendGender) => {
  if (frontendGender === 'Male') return 'L';
  if (frontendGender === 'Female') return 'P';
  return frontendGender; // Already in backend format
};

const isLoading = ref(true);
const isSubmitting = ref(false);
const showModal = ref(false);
const modalType = ref('info');
const modalMessage = ref('');
const modalRef = ref(null);

// Form data
const formData = ref({
  studentid: null,
  fullname: '',
  gender: '',
  address: '',
  phone: '',
  parentname: '',
  parentphone: '',
  relationship: '',
  birthdate: '',
  birthplace: '',
  classid: null,
  userid: null,
  occupation: '',
  program_interest: '',
  english_level: '',
  referral_source: '',
  learning_mode: '',
  preferred_time: '',
  studied_before: '',
  learning_reason: ''
});

// Validation errors
const errors = ref({});

// Gender options for select
const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' }
];

// Basic validation
const validateForm = () => {
  errors.value = {};

  if (!formData.value.fullname || formData.value.fullname.trim().length < 2) {
    errors.value.fullname = 'Full name must be at least 2 characters';
  }

  if (!formData.value.gender) {
    errors.value.gender = 'Gender is required';
  }

  if (!formData.value.address || formData.value.address.trim().length === 0) {
    errors.value.address = 'Address is required';
  }

  if (!formData.value.phone || !/^08\d{8,11}$/.test(formData.value.phone)) {
    errors.value.phone = 'Phone must start with 08 and have 10-13 digits';
  }

  if (!formData.value.parentname || formData.value.parentname.trim().length === 0) {
    errors.value.parentname = 'Emergency contact name is required';
  }

  if (formData.value.parentphone && !/^08\d{8,11}$/.test(formData.value.parentphone)) {
    errors.value.parentphone = 'Emergency contact phone must start with 08 and have 10-13 digits';
  }

  return Object.keys(errors.value).length === 0;
};

const fetchProfile = async () => {
  const userId = authStore.user?.id;
  if (!userId) {
    modalType.value = 'error';
    modalMessage.value = "User not authenticated.";
    openModal();
    isLoading.value = false;
    return;
  }

  try {
    const response = await studentAPI.getStudentById(userId);
    if (response.data.success) {
      // Handle both array and single object responses
      let data = response.data.data;
      if (Array.isArray(data)) {
        data = data[0]; // Take first element if array
      }
      // Assign backend data directly to form
      if (data) {
        Object.assign(formData.value, data);
      }
    }
  } catch (error) {
    modalType.value = 'error';
    modalMessage.value = "Failed to load profile data.";
    openModal();
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const handleUpdateProfile = async () => {
  // Validate form
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const userId = formData.value.userid || authStore.user?.id;

    if (!userId) {
      throw new Error('Cannot update profile: User ID not found.');
    }

    // Transform gender to backend format before sending
    const updateData = {
      ...formData.value,
      gender: mapGenderToBackend(formData.value.gender)
    };

    const response = await studentAPI.updateStudent(userId, updateData);
    if (response.data.success) {
      modalType.value = 'success';
      modalMessage.value = "Profile updated successfully!";
      openModal();
    }
  } catch (error) {
    console.error('Update error:', error);
    modalType.value = 'error';
    modalMessage.value = error.message || "Failed to update profile. Please try again.";
    openModal();
  } finally {
    isSubmitting.value = false;
  }
};

const reset = () => {
  fetchProfile();
  errors.value = {};
};

const openModal = async () => {
  showModal.value = true;
  await nextTick();
  if (modalRef.value) {
    modalRef.value.focus();
  }
};

const closeModal = () => {
  showModal.value = false;
  modalType.value = 'info';
  modalMessage.value = '';
};

onMounted(fetchProfile);
</script>

<template>
  <div class="w-full px-4 py-8">
    <h1 class="text-5xl font-bold text-gray-900 mb-10">Edit Profile</h1>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-blue-50 rounded-3xl p-10 shadow-lg animate-pulse">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        <div class="h-12 bg-white rounded-full"></div>
        <div class="h-12 bg-white rounded-full"></div>
        <div class="h-12 bg-white rounded-full"></div>
        <div class="h-12 bg-white rounded-full"></div>
        <div class="h-12 bg-white rounded-full"></div>
        <div class="h-12 bg-white rounded-full"></div>
        <div class="h-12 bg-white rounded-full"></div>
        <div class="h-12 bg-white rounded-full"></div>
      </div>

      <div class="flex justify-end gap-4 mt-10">
        <div class="h-12 w-28 bg-white rounded-full"></div>
        <div class="h-12 w-32 bg-blue-200 rounded-full"></div>
      </div>
    </div>

    <!-- Form Content -->
    <div v-else class="bg-blue-50 rounded-3xl p-10 shadow-lg">
      <form @submit.prevent="handleUpdateProfile">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          <!-- Full Name -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">Full Name</label>
            <input v-model="formData.fullname" type="text" placeholder="Full Name"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
              required />
            <p v-if="errors.fullname" class="mt-2 text-sm text-red-600">{{ errors.fullname }}</p>
          </div>

          <!-- Birth Date -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">Birth Date</label>
            <input v-model="formData.birthdate" type="date"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors" />
            <p v-if="errors.birthdate" class="mt-2 text-sm text-red-600">{{ errors.birthdate }}</p>
          </div>

          <!-- Address -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">Address</label>
            <input v-model="formData.address" type="text" placeholder="Complete address"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
              required />
            <p v-if="errors.address" class="mt-2 text-sm text-red-600">{{ errors.address }}</p>
          </div>

          <!-- Place Date (Birth Place) -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">Birth Place</label>
            <input v-model="formData.birthplace" type="text" placeholder="Birth Place"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors" />
            <p v-if="errors.birthplace" class="mt-2 text-sm text-red-600">{{ errors.birthplace }}</p>
          </div>

          <!-- Gender -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">Gender</label>
            <select v-model="formData.gender"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
              required>
              <option value="" disabled>Select Gender</option>
              <option v-for="option in genderOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <p v-if="errors.gender" class="mt-2 text-sm text-red-600">{{ errors.gender }}</p>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">Phone</label>
            <input v-model="formData.phone" type="tel" placeholder="08xxxxxxxxxx"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
              required />
            <p v-if="errors.phone" class="mt-2 text-sm text-red-600">{{ errors.phone }}</p>
          </div>

        </div>

        <!-- Emergency Contact Section -->
        <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-6">Emergency Contact</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          <!-- Emergency Contact Name -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">Full Name</label>
            <input v-model="formData.parentname" type="text" placeholder="Emergency contact's full name"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
              required />
            <p v-if="errors.parentname" class="mt-2 text-sm text-red-600">{{ errors.parentname }}</p>
          </div>

          <!-- Relationship -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">Relationship</label>
            <input v-model="formData.relationship" type="text" placeholder="e.g. Parent, Spouse, Sibling"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors" />
          </div>

          <!-- Emergency Contact Phone -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">Phone Number</label>
            <input v-model="formData.parentphone" type="tel" placeholder="08xxxxxxxxxx"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors" />
            <p v-if="errors.parentphone" class="mt-2 text-sm text-red-600">{{ errors.parentphone }}</p>
          </div>
        </div>

        <!-- Background Section -->
        <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-6">Background</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          <!-- Occupation -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">Occupation</label>
            <select v-model="formData.occupation"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors">
              <option value="" disabled>Select Occupation</option>
              <option v-for="option in OCCUPATIONS" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
        </div>

        <!-- Course Information Section -->
        <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-6">Course Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          <!-- Program -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">Program</label>
            <select v-model="formData.program_interest"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors">
              <option value="" disabled>Select Program</option>
              <option v-for="option in PROGRAMS" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>

          <!-- English Level -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">Current English Level</label>
            <select v-model="formData.english_level"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors">
              <option value="" disabled>Select Level</option>
              <option v-for="option in ENGLISH_LEVELS" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>

          <!-- Studied Before -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">Have you studied English before?</label>
            <select v-model="formData.studied_before"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors">
              <option value="" disabled>Select</option>
              <option v-for="option in STUDIED_BEFORE" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>

          <!-- Learning Reason -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">Main reason for learning English</label>
            <select v-model="formData.learning_reason"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors">
              <option value="" disabled>Select Reason</option>
              <option v-for="option in LEARNING_REASONS" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>

          <!-- Learning Mode -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">Learning Mode</label>
            <select v-model="formData.learning_mode"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors">
              <option value="" disabled>Select Mode</option>
              <option v-for="option in LEARNING_MODES" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>

          <!-- Preferred Time -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">Preferred Time</label>
            <select v-model="formData.preferred_time"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors">
              <option value="" disabled>Select Time</option>
              <option v-for="option in PREFERRED_TIMES" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>

          <!-- Referral Source -->
          <div>
            <label class="block text-base font-bold text-blue-600 mb-3">How did you hear about us?</label>
            <select v-model="formData.referral_source"
              class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors">
              <option value="" disabled>Select Source</option>
              <option v-for="option in REFERRAL_SOURCES" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4 mt-10">
          <button type="button" @click="reset"
            class="px-8 py-3 bg-white text-gray-700 font-semibold text-base rounded-full hover:bg-gray-100 border border-gray-300 transition-colors"
            :disabled="isSubmitting">
            Reset
          </button>

          <button type="submit"
            class="px-8 py-3 bg-blue-600 text-white font-semibold text-base rounded-full hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isSubmitting">
            <span v-if="isSubmitting">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Modal Component -->
    <Modal :show="showModal" :type="modalType" :message="modalMessage" @close="closeModal" @confirm="closeModal" />
  </div>
</template>
