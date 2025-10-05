import { ref, onMounted } from 'vue';
import { lecturerAPI } from '../services/api';
import { authStore } from '../store/auth';

/**
 * Map gender from backend to frontend.
 * @param {string} gender - Backend gender code (L/P)
 * @returns {string} Frontend display text
 */
const mapGenderToFrontend = (gender) => {
  const mapping = { L: 'Laki-laki', P: 'Perempuan' };
  return mapping[gender] || gender;
};

/**
 * Map gender from frontend to backend.
 * @param {string} gender - Frontend display text
 * @returns {string} Backend gender code
 */
const mapGenderToBackend = (gender) => {
  const mapping = { 'Laki-laki': 'L', 'Perempuan': 'P' };
  return mapping[gender] || gender;
};

/**
 * Manage lecturer profile.
 * @returns {Object} State and functions
 */
export function useLecturerProfile() {
  const lecturerProfile = ref(null);
  const isLoading = ref(true);
  const errorMessage = ref('');
  const isUpdating = ref(false);

  /**
   * Fetch lecturer profile data.
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
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        lecturerProfile.value = {
          ...data,
          gender: mapGenderToFrontend(data.gender)
        };
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
   * Update lecturer profile data.
   * @param {Object} updateData - Data to update
   * @returns {boolean} True if successful
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
   * Get all lecturers data.
   * @returns {Array} List of lecturers
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
    // Only fetch profile if user is lecturer
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
    mapGenderToBackend // Export for use in forms
  };
}