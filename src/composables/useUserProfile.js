import { ref, onMounted } from 'vue';
import { userAPI } from '../services/api';
import { authStore } from '../store/auth';

/**
 * Kelola profil user umum.
 * @returns {Object} State dan fungsi profil
 */
export function useUserProfile() {
  const userProfile = ref(null);
  const isLoading = ref(true);
  const errorMessage = ref('');
  const isUpdating = ref(false);

  /**
   * Ambil data profil user.
   */
  const fetchUserProfile = async () => {
    const userId = authStore.user?.id;
    if (!userId) {
      errorMessage.value = "User not authenticated. Please log in.";
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    errorMessage.value = '';
    try {
      const response = await userAPI.getUserById(userId);
      if (response.data.success) {
        userProfile.value = response.data.data;
      } else {
        errorMessage.value = response.data.message || "Profile not found.";
      }
    } catch (error) {
      if (error.message && error.message.includes('Too many requests')) {
        errorMessage.value = error.message;
      } else {
        errorMessage.value = "Failed to fetch profile data. Please try again later.";
      }
      console.error("Failed to fetch user profile:", error);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Perbarui data profil user.
   * @param {Object} updateData - Data yang akan diperbarui
   * @returns {boolean} True jika berhasil
   */
  const updateUserProfile = async (updateData) => {
    const userId = authStore.user?.id;
    if (!userId) {
      errorMessage.value = "User not authenticated. Please log in.";
      return false;
    }

    isUpdating.value = true;
    errorMessage.value = '';
    try {
      const response = await userAPI.updateUser(userId, updateData);
      if (response.data.success) {
        userProfile.value = response.data.data;
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
      console.error("Failed to update user profile:", error);
      return false;
    } finally {
      isUpdating.value = false;
    }
  };

  /**
   * Buat profil user baru.
   * @param {Object} userData - Data user baru
   * @returns {boolean} True jika berhasil
   */
  const createUserProfile = async (userData) => {
    isUpdating.value = true;
    errorMessage.value = '';
    try {
      const response = await userAPI.createUser(userData);
      if (response.data.success) {
        userProfile.value = response.data.data;
        return true;
      } else {
        errorMessage.value = response.data.message || "Failed to create profile.";
        return false;
      }
    } catch (error) {
      // Handle rate limiting and other errors
      if (error.message && error.message.includes('Too many requests')) {
        errorMessage.value = error.message;
      } else {
        errorMessage.value = "Failed to create profile. Please try again later.";
      }
      console.error("Failed to create user profile:", error);
      return false;
    } finally {
      isUpdating.value = false;
    }
  };

  onMounted(fetchUserProfile);

  return {
    userProfile,
    isLoading,
    isUpdating,
    errorMessage,
    fetchUserProfile,
    updateUserProfile,
    createUserProfile,
  };
}