import { ref, computed } from 'vue';

/**
 * Composable for managing student transfer between classes
 * Handles the logic for dual-panel transfer list UI
 */
export function useStudentTransfer(currentClassId, allStudents, onSave) {
  const searchQuery = ref('');
  const filterClassId = ref('');
  const selectedAvailable = ref(new Set());
  const selectedEnrolled = ref(new Set());
  const isLoading = ref(false);
  const error = ref(null);

  /**
   * Students currently enrolled in the target class
   */
  const enrolledStudents = computed(() => {
    if (!allStudents.value) return [];
    return allStudents.value.filter(s => s.classid === currentClassId.value);
  });

  /**
   * Students available for enrollment (from other classes or unassigned)
   * Filtered by search query and class filter
   */
  const availableStudents = computed(() => {
    if (!allStudents.value) return [];
    
    let students = allStudents.value.filter(s => s.classid !== currentClassId.value);
    
    // Apply search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      students = students.filter(s => 
        s.fullname?.toLowerCase().includes(query) ||
        s.tbuser?.email?.toLowerCase().includes(query) ||
        s.tbuser?.username?.toLowerCase().includes(query)
      );
    }
    
    // Apply class filter
    if (filterClassId.value) {
      students = students.filter(s => s.classid === filterClassId.value);
    }
    
    return students;
  });

  /**
   * Get class code for display
   */
  const getStudentClassCode = (student, classes) => {
    if (!student.classid) return 'Unassigned';
    const cls = classes.find(c => c.classid === student.classid);
    return cls?.class_code || 'Unknown';
  };

  /**
   * Toggle selection in available students list
   */
  const toggleAvailableSelection = (studentid) => {
    if (selectedAvailable.value.has(studentid)) {
      selectedAvailable.value.delete(studentid);
    } else {
      selectedAvailable.value.add(studentid);
    }
  };

  /**
   * Toggle selection in enrolled students list
   */
  const toggleEnrolledSelection = (studentid) => {
    if (selectedEnrolled.value.has(studentid)) {
      selectedEnrolled.value.delete(studentid);
    } else {
      selectedEnrolled.value.add(studentid);
    }
  };

  /**
   * Select all available students
   */
  const selectAllAvailable = () => {
    availableStudents.value.forEach(s => selectedAvailable.value.add(s.studentid));
  };

  /**
   * Deselect all available students
   */
  const deselectAllAvailable = () => {
    selectedAvailable.value.clear();
  };

  /**
   * Select all enrolled students
   */
  const selectAllEnrolled = () => {
    enrolledStudents.value.forEach(s => selectedEnrolled.value.add(s.studentid));
  };

  /**
   * Deselect all enrolled students
   */
  const deselectAllEnrolled = () => {
    selectedEnrolled.value.clear();
  };

  /**
   * Move selected available students to enrolled list
   */
  const moveToEnrolled = () => {
    // Create new enrolled set with existing + newly selected
    const newEnrolled = new Set([
      ...enrolledStudents.value.map(s => s.studentid),
      ...selectedAvailable.value
    ]);
    
    // Clear available selections
    selectedAvailable.value.clear();
    
    return newEnrolled;
  };

  /**
   * Move selected enrolled students to available list
   */
  const moveToAvailable = () => {
    // Create new enrolled set excluding selected ones
    const newEnrolled = new Set(
      enrolledStudents.value
        .map(s => s.studentid)
        .filter(id => !selectedEnrolled.value.has(id))
    );
    
    // Clear enrolled selections
    selectedEnrolled.value.clear();
    
    return newEnrolled;
  };

  /**
   * Move all available students to enrolled
   */
  const moveAllToEnrolled = () => {
    const newEnrolled = new Set([
      ...enrolledStudents.value.map(s => s.studentid),
      ...availableStudents.value.map(s => s.studentid)
    ]);
    
    selectedAvailable.value.clear();
    return newEnrolled;
  };

  /**
   * Move all enrolled students to available
   */
  const moveAllToAvailable = () => {
    selectedEnrolled.value.clear();
    return new Set();
  };

  /**
   * Save changes and trigger API calls
   */
  const save = async (newEnrolledSet) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      await onSave(newEnrolledSet);
      
      // Clear selections after successful save
      selectedAvailable.value.clear();
      selectedEnrolled.value.clear();
    } catch (err) {
      error.value = err.message || 'Failed to save student assignments';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Reset all selections
   */
  const reset = () => {
    searchQuery.value = '';
    filterClassId.value = '';
    selectedAvailable.value.clear();
    selectedEnrolled.value.clear();
    error.value = null;
  };

  return {
    // State
    searchQuery,
    filterClassId,
    selectedAvailable,
    selectedEnrolled,
    isLoading,
    error,
    
    // Computed
    enrolledStudents,
    availableStudents,
    
    // Methods
    getStudentClassCode,
    toggleAvailableSelection,
    toggleEnrolledSelection,
    selectAllAvailable,
    deselectAllAvailable,
    selectAllEnrolled,
    deselectAllEnrolled,
    moveToEnrolled,
    moveToAvailable,
    moveAllToEnrolled,
    moveAllToAvailable,
    save,
    reset
  };
}
