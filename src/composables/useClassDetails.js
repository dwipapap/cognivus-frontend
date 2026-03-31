import { ref, watchEffect, toValue } from 'vue';
import { classAPI, levelAPI, lecturerAPI, priceAPI, programAPI } from '../services/api';

const formatLecturerName = (fullname, gender) => {
  if (!fullname) return '-';
  
  const prefix = gender === 'P' ? 'Mrs. ' : gender === 'L' ? 'Mr. ' : '';
  return `${prefix}${fullname}`;
};

export function useClassDetails(classId) {
  const classInfo = ref(null);
  const levelName = ref('');
  const lecturerName = ref('');
  const programName = ref('');
  const isLoading = ref(false);
  const error = ref(null);

  const fetchDetails = async () => {
    const id = toValue(classId);
    if (!id) return;

    isLoading.value = true;
    error.value = null;

    try {
      const classRes = await classAPI.getClassById(id);
      
      if (!classRes.data.success) {
        throw new Error('Class not found');
      }

      classInfo.value = classRes.data.data;

      const [levelRes, lecturersRes] = await Promise.all([
        classInfo.value.levelid 
          ? levelAPI.getLevelById(classInfo.value.levelid)
          : Promise.resolve({ data: { success: false } }),
        classInfo.value.lecturerid
          ? lecturerAPI.getAllLecturers()
          : Promise.resolve({ data: { success: false } })
      ]);

      if (levelRes.data.success) {
        levelName.value = levelRes.data.data.name || '-';
      }

      if (lecturersRes.data.success && classInfo.value.lecturerid) {
        const lecturer = lecturersRes.data.data.find(
          l => l.lecturerid === classInfo.value.lecturerid
        );
        lecturerName.value = lecturer ? formatLecturerName(lecturer.fullname, lecturer.gender) : '-';
      } else {
        lecturerName.value = '-';
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
