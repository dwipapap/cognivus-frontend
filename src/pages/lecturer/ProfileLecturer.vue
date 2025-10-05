<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { lecturerAPI } from '../../services/api';
import { authStore } from '../../store/auth';
import { useForm } from '../../composables/useForm';

// Import reusable components
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseTextarea from '../../components/form/BaseTextarea.vue';
import BaseCard from '../../components/ui/BaseCard.vue';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';

const isLoading = ref(true);
const showModal = ref(false);
const modalType = ref('info');
const modalMessage = ref('');
const modalRef = ref(null);

// Form setup with validation
const { formData, errors, isSubmitting, submit, getFieldProps, reset } = useForm(
  {
    id: null,
    fullname: '',
    age: '',
    birthplace: '',
    address: '',
    phone_number: '',
    birthdate: '',
    academic_background: '',
    user_id: null,
  },
  {
    fullname: ['required', { type: 'minLength', min: 2 }],
    age: ['required'],
    birthplace: ['required'],
    address: ['required'],
    phone_number: ['required', 'phone'],
    birthdate: ['required'],
    academic_background: ['required']
  }
);

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
    if (response.data.success) {
      console.log('Lecturer profile data:', response.data.data);
      console.log('Available fields:', Object.keys(response.data.data));
      
      // Update form data with lecturer profile
      const profileData = response.data.data;
      Object.assign(formData, {
        id: profileData.id,
        fullname: profileData.fullname || '',
        age: profileData.age || '',
        birthplace: profileData.birthplace || '',
        address: profileData.address || '',
        phone_number: profileData.phone_number || '',
        birthdate: profileData.birthdate ? profileData.birthdate.split('T')[0] : '', // Format for date input
        academic_background: profileData.academic_background || '',
        user_id: profileData.user_id
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
      const userId = data.user_id || authStore.user?.id;
      
      if (!userId) {
        throw new Error('Cannot update profile: User ID not found. Please reload the page.');
      }
      
      console.log('Updating lecturer profile with user ID:', userId);
      
      // Prepare data for update
      const updateData = {
        fullname: data.fullname,
        age: parseInt(data.age),
        birthplace: data.birthplace,
        address: data.address,
        phone_number: data.phone_number,
        birthdate: data.birthdate,
        academic_background: data.academic_background
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

onMounted(fetchProfile);
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Edit Lecturer Profile</h1>

    <LoadingSpinner
      v-if="isLoading"
      center
      size="lg"
      text="Loading profile data..."
    />

    <BaseCard v-else size="lg" class="max-w-4xl">
      <template #title>
        <h2 class="text-xl font-semibold text-gray-800">Lecturer Information</h2>
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
          
          <!-- Age -->
          <BaseInput
            v-bind="getFieldProps('age')"
            type="number"
            label="Age"
            placeholder="Age"
            min="18"
            max="100"
            required
          />

          <!-- Birthplace -->
          <BaseInput
            v-bind="getFieldProps('birthplace')"
            label="Birthplace"
            placeholder="Birthplace"
            required
          />

          <!-- Phone Number -->
          <BaseInput
            v-bind="getFieldProps('phone_number')"
            type="tel"
            label="Phone Number"
            placeholder="08xxxxxxxxxx"
            required
          />

          <!-- Birthdate -->
          <BaseInput
            v-bind="getFieldProps('birthdate')"
            type="date"
            label="Birthdate"
            required
          />

          <!-- Academic Background -->
          <BaseInput
            v-bind="getFieldProps('academic_background')"
            label="Academic Background"
            placeholder="e.g., M.A. in English Literature"
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
/* Component styles already handled by base components */
</style>