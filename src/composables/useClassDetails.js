import { ref, watchEffect, toValue } from 'vue';
import { classAPI, levelAPI, lecturerAPI, priceAPI, programAPI } from '../services/api';

/**
 * Fetch class details with level, lecturer, and program info.
 * Loads data in parallel. Auto-fetches when classId changes.
 * 
 * @param {import('vue').Ref<number> | number} classId - Class ID (can be ref or number)
 * @returns {{ classInfo: import('vue').Ref, levelName: import('vue').Ref<string>, lecturerName: import('vue').Ref<string>, programName: import('vue').Ref<string>, isLoading: import('vue').Ref<boolean>, error: import('vue').Ref<string|null>, retry: Function }}
 */
export function useClassDetails(classId) {
  const classInfo = ref(null);
  const levelName = ref('');
  const lecturerName = ref('');
  const programName = ref('');
  const isLoading = ref(false);
  const error = ref(null);

  /** Fetch all class-related data in parallel */
  const fetchDetails = async () => {
    const id = toValue(classId);
    if (!id) return;

    isLoading.value = true;
    error.value = null;

    try {
      // Parallel fetch: class info
      const classRes = await classAPI.getClassById(id);
      
      if (!classRes.data.success) {
        throw new Error('Class not found');
      }

      classInfo.value = classRes.data.data;

      // Parallel fetch: level and lecturers
      const [levelRes, lecturersRes] = await Promise.all([
        classInfo.value.levelid 
          ? levelAPI.getLevelById(classInfo.value.levelid)
          : Promise.resolve({ data: { success: false } }),
        classInfo.value.lecturerid
          ? lecturerAPI.getAllLecturers()
          : Promise.resolve({ data: { success: false } })
      ]);

      // Set level name
      if (levelRes.data.success) {
        levelName.value = levelRes.data.data.name || '-';
      }

      // Find lecturer by ID
      if (lecturersRes.data.success && classInfo.value.lecturerid) {
        const lecturer = lecturersRes.data.data.find(
          l => l.lecturerid === classInfo.value.lecturerid
        );
        lecturerName.value = lecturer?.fullname || '-';
      }

      // Fetch program name based on level
      if (classInfo.value.levelid) {
        try {
          const priceRes = await priceAPI.getAllPrices();
          if (priceRes.data?.success && priceRes.data?.data) {
            const matchingPrice = priceRes.data.data.find(
              p => p.levelid === classInfo.value.levelid
            );
            
            if (matchingPrice?.programid) {
              const programRes = await programAPI.getProgramById(matchingPrice.programid);
              if (programRes.data?.success) {
                programName.value = programRes.data.data.name || '-';
              }
            }
          }
        } catch (err) {
          console.error('Error fetching program:', err);
          programName.value = '-';
        }
      }
    } catch (err) {
      error.value = err.message || 'Failed to load class details';
      console.error('Error fetching class details:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Auto-fetch when classId changes
  watchEffect(() => {
    fetchDetails();
  });

  return {
    classInfo,
    levelName,
    lecturerName,
    programName,
    isLoading,
    error,
    retry: fetchDetails
  };
}
