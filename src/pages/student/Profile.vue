<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { studentAPI } from '../../services/api';
import { authStore } from '../../store/auth';
import Modal from '../../components/ui/Modal.vue';
import ProfileSection from '../../components/ui/ProfileSection.vue';
import FormField from '../../components/ui/FormField.vue';
import USelect from '@nuxt/ui/components/Select.vue';
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

// Shared Nuxt UI select styling to match the existing rounded-full blue input look
const selectUi = {
  base: 'w-full',
  trigger: 'rounded-full bg-white ring-1 ring-blue-200 focus:ring-2 focus:ring-blue-200 px-6 py-3 text-base font-medium text-gray-900',
  value: 'text-base font-medium text-gray-900',
  placeholder: 'text-base font-medium text-gray-400',
  trailingIcon: 'text-blue-600 size-5'
};

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
    <div v-else class="bg-blue-50 rounded-3xl p-6 md:p-10 shadow-lg">
      <form @submit.prevent="handleUpdateProfile" class="flex flex-col gap-4 md:gap-6">
        <!-- Personal Information -->
        <ProfileSection title="Personal Information" :default-open="true">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <FormField label="Full Name" :error="errors.fullname">
              <input v-model="formData.fullname" type="text" placeholder="Full Name"
                class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                required />
            </FormField>

            <FormField label="Birth Date" :error="errors.birthdate">
              <input v-model="formData.birthdate" type="date"
                class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors" />
            </FormField>

            <FormField label="Address" :error="errors.address">
              <input v-model="formData.address" type="text" placeholder="Complete address"
                class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                required />
            </FormField>

            <FormField label="Birth Place" :error="errors.birthplace">
              <input v-model="formData.birthplace" type="text" placeholder="Birth Place"
                class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors" />
            </FormField>

            <FormField label="Gender" :error="errors.gender">
              <USelect
                v-model="formData.gender"
                :items="genderOptions"
                :ui="selectUi"
                placeholder="Select Gender"
                :color="errors.gender ? 'error' : 'primary'"
              />
            </FormField>

            <FormField label="Phone" :error="errors.phone">
              <input v-model="formData.phone" type="tel" placeholder="08xxxxxxxxxx"
                class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                required />
            </FormField>
          </div>
        </ProfileSection>

        <!-- Emergency Contact -->
        <ProfileSection title="Emergency Contact">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <FormField label="Full Name" :error="errors.parentname">
              <input v-model="formData.parentname" type="text" placeholder="Emergency contact's full name"
                class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                required />
            </FormField>

            <FormField label="Relationship">
              <input v-model="formData.relationship" type="text" placeholder="e.g. Parent, Spouse, Sibling"
                class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors" />
            </FormField>

            <FormField label="Phone Number" :error="errors.parentphone">
              <input v-model="formData.parentphone" type="tel" placeholder="08xxxxxxxxxx"
                class="w-full bg-white rounded-full px-6 py-3 text-base font-medium text-gray-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors" />
            </FormField>
          </div>
        </ProfileSection>

        <!-- Background -->
        <ProfileSection title="Background">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <FormField label="Occupation">
              <USelect
                v-model="formData.occupation"
                :items="OCCUPATIONS"
                :ui="selectUi"
                placeholder="Select Occupation"
              />
            </FormField>
          </div>
        </ProfileSection>

        <!-- Course Information -->
        <ProfileSection title="Course Information">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <FormField label="Program">
              <USelect
                v-model="formData.program_interest"
                :items="PROGRAMS"
                :ui="selectUi"
                placeholder="Select Program"
              />
            </FormField>

            <FormField label="Current English Level">
              <USelect
                v-model="formData.english_level"
                :items="ENGLISH_LEVELS"
                :ui="selectUi"
                placeholder="Select Level"
              />
            </FormField>

            <FormField label="Have you studied English before?">
              <USelect
                v-model="formData.studied_before"
                :items="STUDIED_BEFORE"
                :ui="selectUi"
                placeholder="Select"
              />
            </FormField>

            <FormField label="Main reason for learning English">
              <USelect
                v-model="formData.learning_reason"
                :items="LEARNING_REASONS"
                :ui="selectUi"
                placeholder="Select Reason"
              />
            </FormField>

            <FormField label="Learning Mode">
              <USelect
                v-model="formData.learning_mode"
                :items="LEARNING_MODES"
                :ui="selectUi"
                placeholder="Select Mode"
              />
            </FormField>

            <FormField label="Preferred Time">
              <USelect
                v-model="formData.preferred_time"
                :items="PREFERRED_TIMES"
                :ui="selectUi"
                placeholder="Select Time"
              />
            </FormField>

            <FormField label="How did you hear about us?">
              <USelect
                v-model="formData.referral_source"
                :items="REFERRAL_SOURCES"
                :ui="selectUi"
                placeholder="Select Source"
              />
            </FormField>
          </div>
        </ProfileSection>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4">
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
