import { computed } from 'vue';

/**
 * Default placeholder images for courses without thumbnails
 */
const placeholderImages = [
  'https://semilir.co/wp-content/uploads/2023/01/buku-buku.jpg',
  'https://www.pertuni.or.id/wp-content/uploads/2021/01/books-690219_1920.jpg',
  'https://ichef.bbci.co.uk/ace/ws/640/amz/worldservice/live/assets/images/2016/03/26/160326125304_libreria_bookstore_1_640x360_iwanbaan_nocredit.jpg.webp'
];

/**
 * Get time-based greeting based on current hour
 */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
};

/**
 * Get placeholder image by index (cycles through available images)
 */
export const getPlaceholderImage = (index) => placeholderImages[index % placeholderImages.length];

/**
 * Course status categories
 */
const courseStatus = {
  NEW: 'new',
  RECENT: 'recent',
  OLDER: 'older'
};

/**
 * Get course status based on upload date
 * @param {Object} course - Course object with upload_date property
 * @returns {string} 'new', 'recent', or 'older'
 */
const getCourseStatus = (course) => {
  if (!course?.upload_date) return courseStatus.OLDER;

  const daysSinceUpload = Math.floor(
    (new Date() - new Date(course.upload_date)) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceUpload <= 7) return courseStatus.NEW;
  if (daysSinceUpload <= 30) return courseStatus.RECENT;
  return courseStatus.OLDER;
};

/**
 * Get status text for display
 */
export const getCourseStatusText = (course) => {
  const status = getCourseStatus(course);
  return {
    [courseStatus.NEW]: 'New',
    [courseStatus.RECENT]: 'Recent',
    [courseStatus.OLDER]: 'Older'
  }[status] || 'Older';
};

/**
 * Get status badge classes based on course status
 */
export const getStatusBadgeClass = (course) => {
  const status = getCourseStatus(course);
  return {
    [courseStatus.NEW]: 'bg-green-500',
    [courseStatus.RECENT]: 'bg-blue-500',
    [courseStatus.OLDER]: 'bg-gray-500'
  }[status] || 'bg-gray-500';
};

/**
 * Composable for dashboard utilities
 */
export function useDashboardUtils() {
  /**
   * Computed greeting that updates in real-time
   */
  const greeting = computed(() => getGreeting());

  /**
   * Sort and filter courses for dashboard display
   * @param {Array} courses - Array of course objects
   * @param {number} limit - Maximum number of courses to return
   * @returns {Array} Sorted and limited courses
   */
  const getDashboardCourses = (courses, limit = 3) => {
    if (!courses || !Array.isArray(courses)) return [];

    return [...courses]
      .sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date))
      .slice(0, limit);
  };

  return {
    // Functions
    getPlaceholderImage,
    getCourseStatusText,
    getStatusBadgeClass,
    getDashboardCourses,

    // Computed
    greeting
  };
}
