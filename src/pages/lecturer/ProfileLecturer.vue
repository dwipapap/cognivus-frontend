<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { lecturerAPI } from '../../services/api';
import { authStore } from '../../store/auth';
import { useForm } from '../../composables/useForm';
import { useLecturerProfile } from '../../composables/useLecturerProfile';

// Import reusable components
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseSelect from '../../components/form/BaseSelect.vue';
import BaseTextarea from '../../components/form/BaseTextarea.vue';
import BaseCard from '../../components/ui/BaseCard.vue';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';

const { mapGenderToBackend } = useLecturerProfile();
const router = useRouter();

const isLoading = ref(true);
const showModal = ref(false);
const modalType = ref('info');
const modalMessage = ref('');
const modalRef = ref(null);

// Form setup with validation
const { formData, errors, isSubmitting, submit, getFieldProps, reset } = useForm(
  {
    lecturerid: null,
    fullname: '',
    gender: '',
    birthplace: '',
    birthdate: '',
    address: '',
    phone: '',
    lasteducation: '',
    userid: null
  },
  {
    fullname: ['required', { type: 'minLength', min: 2 }],
    gender: ['required'],
    birthplace: ['required'],
    address: ['required'],
    phone: ['required', 'phone'],
    birthdate: ['required'],
    lasteducation: ['required']
  }
);

const genderOptions = [
  { value: 'Laki-laki', label: 'Laki-laki' },
  { value: 'Perempuan', label: 'Perempuan' }
];

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
    const response = await lecturerAPI.getLecturerById(userId);
    if (response.data.success && response.data.data) {
      const profileData = response.data.data;
      Object.assign(formData, {
        ...profileData,
        birthdate: profileData.birthdate ? profileData.birthdate.split('T')[0] : ''
      });
    }
  } catch (error) {
    modalType.value = 'error';
    modalMessage.value = "Failed to fetch profile data.";
    openModal();
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const handleUpdateProfile = async () => {
  try {
    await submit(async (data) => {
      const userId = data.userid || authStore.user?.id;
      
      if (!userId) {
        throw new Error('Cannot update profile: User ID not found.');
      }
      
      // Transform gender to backend format
      const updateData = {
        ...data,
        gender: mapGenderToBackend(data.gender)
      };
      
      const response = await lecturerAPI.updateLecturer(userId, updateData);
      if (response.data.success) {
        modalType.value = 'success';
        modalMessage.value = "Profile updated successfully!";
        openModal();
      }
    });
  } catch (error) {
    console.error('Update error:', error);
    modalType.value = 'error';
    modalMessage.value = error.message || "Failed to update profile. Please try again.";
    openModal();
  }
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

const handleCancel = () => {
  router.push('/lecturer/profile/view');
};

onMounted(fetchProfile);
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="max-w-2xl mx-auto py-20">
    <LoadingSpinner center size="lg" text="Loading profile data..." />
  </div>

  <!-- Main Content -->
  <div v-else class="space-y-8 mb-8">
    <!-- Header Card -->
    <div class="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg overflow-hidden">
      <div class="absolute top-0 right-0 w-1/2 h-full pointer-events-none overflow-hidden opacity-20">
        <div class="absolute -top-10 -right-10 w-40 h-48 bg-white rounded-lg transform rotate-12"></div>
        <div class="absolute top-20 -right-5 w-32 h-40 bg-white rounded-lg transform rotate-12"></div>
        <div class="absolute top-40 right-10 w-28 h-36 bg-white rounded-lg transform rotate-12"></div>
      </div>

      <div class="relative p-5 md:p-8 z-10">
        <div class="mb-6">
          <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Edit Profile</h1>
          <p class="text-sm text-white/80 max-w-2xl">
            Update your personal information and account details.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
            <svg class="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p class="text-white text-sm font-medium">Lecturer Information</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Card -->
    <form @submit.prevent="handleUpdateProfile" class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 md:p-8 shadow-sm">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h2 class="text-xl md:text-2xl font-bold text-gray-900">Personal Information</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Full Name -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
          <BaseInput
            v-bind="getFieldProps('fullname')"
            label="Full Name"
            placeholder="Full Name"
            required
          />
        </div>
        
        <!-- Gender -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
          <BaseSelect
            v-bind="getFieldProps('gender')"
            label="Gender"
            placeholder="Select Gender"
            :options="genderOptions"
            required
          />
        </div>

        <!-- Birthplace -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
          <BaseInput
            v-bind="getFieldProps('birthplace')"
            label="Birth Place"
            placeholder="Birth Place"
            required
          />
        </div>

        <!-- Birthdate -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
          <BaseInput
            v-bind="getFieldProps('birthdate')"
            type="date"
            label="Birth Date"
            required
          />
        </div>

        <!-- Phone Number -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
          <BaseInput
            v-bind="getFieldProps('phone')"
            type="tel"
            label="Phone Number"
            placeholder="08xxxxxxxxxx"
            required
          />
        </div>

        <!-- Last Education -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
          <BaseInput
            v-bind="getFieldProps('lasteducation')"
            label="Education Level"
            placeholder="e.g., M.A. in English Literature"
            required
          />
        </div>

        <!-- Address -->
        <div class="md:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
          <BaseTextarea
            v-bind="getFieldProps('address')"
            label="Address"
            placeholder="Complete address"
            :rows="4"
            required
          />
        </div>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-blue-200">
        <BaseButton
          type="button"
          variant="glass-secondary"
          @click="handleCancel"
          class="flex-1"
        >
          Cancel
        </BaseButton>
        
        <BaseButton
          type="submit"
          variant="glass-primary"
          :loading="isSubmitting"
          class="flex-1"
        >
          Update Profile
        </BaseButton>
      </div>
    </form>

    <!-- Modal Component -->
    <Modal
      :show="showModal"
      :type="modalType"
      :message="modalMessage"
      @close="closeModal"
    />
  </div>
</template>

<style scoped>
/* Component styles already handled by base components */
</style>