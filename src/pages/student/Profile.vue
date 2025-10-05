<script setup>
import { ref, onMounted, nextTick } from 'vue';
import apiClient from '../../services/api';
import { authStore } from '../../store/auth';
import { useForm } from '../../composables/useForm';

// Import reusable components
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseSelect from '../../components/form/BaseSelect.vue';
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
    nama_lengkap: '',
    jenis_kelamin: '',
    alamat: '',
    no_hp: '',
    nama_ortu: '',
    no_hp_ortu: '',
    user_id: null,
  },
  {
    nama_lengkap: ['required', { type: 'minLength', min: 2 }],
    jenis_kelamin: ['required'],
    alamat: ['required'],
    no_hp: ['required', 'phone'],
    nama_ortu: ['required'],
    no_hp_ortu: ['phone']
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
      console.log('Student profile data:', response.data.data);
      console.log('Available fields:', Object.keys(response.data.data));
      
      // Update form data
      Object.assign(formData, response.data.data);
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
      
      console.log('Updating student profile with user ID:', userId);
      
      const response = await apiClient.put(`/students/${userId}`, data);
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
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Edit My Profile</h1>

    <LoadingSpinner
      v-if="isLoading"
      center
      size="lg"
      text="Loading profile data..."
    />

    <BaseCard v-else size="lg" class="max-w-4xl">
      <template #title>
        <h2 class="text-xl font-semibold text-gray-800">Profile Information</h2>
      </template>

      <form @submit.prevent="handleUpdateProfile" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nama Lengkap -->
          <BaseInput
            v-bind="getFieldProps('nama_lengkap')"
            label="Nama Lengkap"
            placeholder="Nama Lengkap"
            required
          />
          
          <!-- Jenis Kelamin -->
          <BaseSelect
            v-bind="getFieldProps('jenis_kelamin')"
            label="Jenis Kelamin"
            placeholder="Pilih Jenis Kelamin"
            :options="genderOptions"
            required
          />

          <!-- Nomor HP -->
          <BaseInput
            v-bind="getFieldProps('no_hp')"
            type="tel"
            label="Nomor HP"
            placeholder="08xxxxxxxxxx"
            required
          />

          <!-- Nama Orang Tua -->
          <BaseInput
            v-bind="getFieldProps('nama_ortu')"
            label="Nama Orang Tua"
            placeholder="Nama Orang Tua"
            required
          />

          <!-- Alamat -->
          <div class="md:col-span-2">
            <BaseTextarea
              v-bind="getFieldProps('alamat')"
              label="Alamat"
              placeholder="Alamat lengkap"
              :rows="4"
              required
            />
          </div>

          <!-- Nomor HP Orang Tua -->
          <BaseInput
            v-bind="getFieldProps('no_hp_ortu')"
            type="tel"
            label="Nomor HP Orang Tua"
            placeholder="08xxxxxxxxxx"
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
