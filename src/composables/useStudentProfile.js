import { ref, onMounted } from 'vue';
import { studentAPI } from '../services/api';
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
 * Manage student profile.
 * @returns {Object} State and functions
 */
export function useStudentProfile() {
  const studentProfile = ref(null);
  const isLoading = ref(true);
  const errorMessage = ref('');

  /**
   * Fetch student profile data.
   */
  const fetchStudentProfile = async () => {
    const userId = authStore.user?.id;
    if (!userId) {
      errorMessage.value = "User not authenticated. Please log in.";
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    errorMessage.value = '';
    try {
      const response = await studentAPI.getStudentById(userId);
      if (response.data.success) {
        // Transform backend gender to frontend display
        // Handle both array and single object responses
        let data = response.data.data;
        if (Array.isArray(data)) {
          data = data[0]; // Take first element if array
        }
        if (data) {
          studentProfile.value = {
            ...data,
            gender: mapGenderToFrontend(data.gender)
          };
        } else {
          errorMessage.value = "Profile not found.";
        }
      } else {
        errorMessage.value = response.data.message || "Profile not found.";
      }
    } catch (error) {
      if (error.message && error.message.includes('Too many requests')) {
        errorMessage.value = error.message;
      } else {
        errorMessage.value = "Failed to fetch profile data. Please try again later.";
      }
      console.error("Failed to fetch student profile:", error);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(fetchStudentProfile);

  return {
    studentProfile,
    isLoading,
    errorMessage,
    fetchStudentProfile,
    mapGenderToBackend // Export for use in forms
  };
}
