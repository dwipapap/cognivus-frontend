<script setup>
import { ref, onMounted, nextTick } from 'vue';
import apiClient from '../../services/api';
import { authStore } from '../../store/auth';
import { useForm } from '../../composables/useForm';
import { useStudentProfile } from '../../composables/useStudentProfile';

// Import reusable components
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseSelect from '../../components/form/BaseSelect.vue';
import BaseTextarea from '../../components/form/BaseTextarea.vue';
import BaseCard from '../../components/ui/BaseCard.vue';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';

const { mapGenderToBackend } = useStudentProfile();

const isLoading = ref(true);
const showModal = ref(false);
const modalType = ref('info');
const modalMessage = ref('');
const modalRef = ref(null);

// Form setup with validation (using backend field names)
const { formData, errors, isSubmitting, submit, getFieldProps, reset } = useForm(
  {
    studentid: null,
    fullname: '',
    gender: '',
    address: '',
    phone: '',
    parentname: '',
    parentphone: '',
    birthdate: '',
    birthplace: '',
    classid: null,
    userid: null
  },
  {
    fullname: ['required', { type: 'minLength', min: 2 }],
    gender: ['required'],
    address: ['required'],
    phone: ['required', 'phone'],
    parentname: ['required'],
    parentphone: ['phone']
  }
);

// Gender options for select
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
    const response = await apiClient.get(`/students/${userId}`);
    if (response.data.success) {
      // Assign backend data directly to form
      Object.assign(formData, response.data.data);
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
  try {
    await submit(async (data) => {
      const userId = data.userid || authStore.user?.id;
      
      if (!userId) {
        throw new Error('Cannot update profile: User ID not found.');
      }
      
      // Transform gender to backend format before sending
      const updateData = {
        ...data,
        gender: mapGenderToBackend(data.gender)
      };
      
      const response = await apiClient.put(`/students/${userId}`, updateData);
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

onMounted(fetchProfile);
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Edit Profil Saya</h1>

    <LoadingSpinner
      v-if="isLoading"
      center
      size="lg"
      text="Memuat data profil..."
    />

    <BaseCard v-else size="lg" class="max-w-4xl">
      <template #title>
        <h2 class="text-xl font-semibold text-gray-800">Informasi Profil</h2>
      </template>

      <form @submit.prevent="handleUpdateProfile" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Full Name -->
          <BaseInput
            v-bind="getFieldProps('fullname')"
            label="Full Name"
            placeholder="Full Name"
            required
          />
          
          <!-- Gender -->
          <BaseSelect
            v-bind="getFieldProps('gender')"
            label="Gender"
            placeholder="Select Gender"
            :options="genderOptions"
            required
          />

          <!-- Phone -->
          <BaseInput
            v-bind="getFieldProps('phone')"
            type="tel"
            label="Phone Number"
            placeholder="08xxxxxxxxxx"
            required
          />

          <!-- Parent Name -->
          <BaseInput
            v-bind="getFieldProps('parentname')"
            label="Parent Name"
            placeholder="Parent Name"
            required
          />

          <!-- Address -->
          <div class="md:col-span-2">
            <BaseTextarea
              v-bind="getFieldProps('address')"
              label="Address"
              placeholder="Complete address"
              :rows="4"
              required
            />
          </div>

          <!-- Parent Phone -->
          <BaseInput
            v-bind="getFieldProps('parentphone')"
            type="tel"
            label="Parent Phone Number"
            placeholder="08xxxxxxxxxx"
          />

          <!-- Birth Place -->
          <BaseInput
            v-bind="getFieldProps('birthplace')"
            label="Birth Place"
            placeholder="Birth Place"
          />

          <!-- Birth Date -->
          <BaseInput
            v-bind="getFieldProps('birthdate')"
            type="date"
            label="Birth Date"
          />
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <BaseButton
            type="button"
            variant="glass-secondary"
            @click="reset"
          >
            Reset
          </BaseButton>
          
          <BaseButton
            type="submit"
            variant="glass-primary"
            :loading="isSubmitting"
          >
            Update Profile
          </BaseButton>
        </div>
      </form>
    </BaseCard>

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
/* Removed all modal styles since we're using the reusable Modal component */
</style>
