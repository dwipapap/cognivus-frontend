import { ref, onMounted } from 'vue';
import { lecturerAPI } from '../services/api';
import { authStore } from '../store/auth';

export function useLecturerProfile() {
  const lecturerProfile = ref(null);
  const isLoading = ref(true);
  const errorMessage = ref('');
  const isUpdating = ref(false);

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
      // Handle rate limiting and other errors
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
    // Only fetch profile if user is a lecturer
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