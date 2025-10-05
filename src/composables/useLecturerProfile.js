import { ref, onMounted } from 'vue';
import { lecturerAPI } from '../services/api';
import { authStore } from '../store/auth';

/**
 * Kelola profil lecturer.
 * @returns {Object} State dan fungsi profil
 */
export function useLecturerProfile() {
  const lecturerProfile = ref(null);
  const isLoading = ref(true);
  const errorMessage = ref('');
  const isUpdating = ref(false);

  /**
   * Ambil data profil lecturer.
   */
  const fetchLecturerProfile = async () => {
    const userId = authStore.user?.id;
    if (!userId) {
      errorMessage.value = "User not authenticated. Please log in.";
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    errorMessage.value = '';
    try {
      const response = await lecturerAPI.getLecturerById(userId);
      if (response.data.success) {
        lecturerProfile.value = response.data.data;
      } else {
        errorMessage.value = response.data.message || "Profile not found.";
      }
    } catch (error) {
      if (error.message && error.message.includes('Too many requests')) {
        errorMessage.value = error.message;
      } else {
        errorMessage.value = "Failed to fetch profile data. Please try again later.";
      }
      console.error("Failed to fetch lecturer profile:", error);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Perbarui data profil lecturer.
   * @param {Object} updateData - Data yang akan diperbarui
   * @returns {boolean} True jika berhasil
   */
  const updateLecturerProfile = async (updateData) => {
    const userId = authStore.user?.id;
    if (!userId) {
      errorMessage.value = "User not authenticated. Please log in.";
      return false;
    }

    isUpdating.value = true;
    errorMessage.value = '';
    try {
      const response = await lecturerAPI.updateLecturer(userId, updateData);
      if (response.data.success) {
        lecturerProfile.value = response.data.data;
        return true;
      } else {
        errorMessage.value = response.data.message || "Failed to update profile.";
        return false;
      }
    } catch (error) {
      // Handle rate limiting and other errors
      if (error.message && error.message.includes('Too many requests')) {
        errorMessage.value = error.message;
      } else {
        errorMessage.value = "Failed to update profile. Please try again later.";
      }
      console.error("Failed to update lecturer profile:", error);
      return false;
    } finally {
      isUpdating.value = false;
    }
  };

  /**
   * Ambil semua data lecturer.
   * @returns {Array} Daftar lecturer
   */
  const getAllLecturers = async () => {
    isLoading.value = true;
    errorMessage.value = '';
    try {
      const response = await lecturerAPI.getAllLecturers();
      if (response.data.success) {
        return response.data.data;
      } else {
        errorMessage.value = response.data.message || "Failed to fetch lecturers.";
        return [];
      }
    } catch (error) {
      // Handle rate limiting and other errors
      if (error.message && error.message.includes('Too many requests')) {
        errorMessage.value = error.message;
      } else {
        errorMessage.value = "Failed to fetch lecturers. Please try again later.";
      }
      console.error("Failed to fetch lecturers:", error);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    // Hanya ambil profil jika pengguna adalah lecturer
    if (authStore.role === 'lecturer') {
      fetchLecturerProfile();
    }
  });

  return {
    lecturerProfile,
    isLoading,
    isUpdating,
    errorMessage,
    fetchLecturerProfile,
    updateLecturerProfile,
    getAllLecturers,
  };
}