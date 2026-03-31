import { computed } from 'vue';

/**
 * Day name to number mapping (Sunday = 0)
 */
export const dayToNumber = {
  'Sunday': 0,
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6
};

/**
 * Default placeholder images for courses without thumbnails
 */
export const placeholderImages = [
  'https://semilir.co/wp-content/uploads/2023/01/buku-buku.jpg',
  'https://www.pertuni.or.id/wp-content/uploads/2021/01/books-690219_1920.jpg',
  'https://ichef.bbci.co.uk/ace/ws/640/amz/worldservice/live/assets/images/2016/03/26/160326125304_libreria_bookstore_1_640x360_iwanbaan_nocredit.jpg.webp'
];

/**
 * Get time-based greeting based on current hour
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
};

/**
 * Format time from 24h to 12h format
 */
export const formatTime = (time) => {
  if (!time) return '';
  
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
};

/**
 * Get placeholder image by index (cycles through available images)
 */
export const getPlaceholderImage = (index) => placeholderImages[index % placeholderImages.length];

/**
 * Course status categories
 */
export const courseStatus = {
  NEW: 'new',
  RECENT: 'recent',
  OLDER: 'older'
};

/**
 * Get course status based on upload date
 * @param {Object} course - Course object with upload_date property
 * @returns {string} 'new', 'recent', or 'older'
 */
export const getCourseStatus = (course) => {
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
 * @param {Object} options - Configuration options
 * @param {number} options.daysUntilNew - Days threshold for 'new' status (default: 7)
 * @param {number} options.daysUntilRecent - Days threshold for 'recent' status (default: 30)
 */
export function useDashboardUtils(options = {}) {
  const { daysUntilNew = 7, daysUntilRecent = 30 } = options;
  
  /**
   * Custom course status with configurable thresholds
   */
  const getCourseStatusCustom = (course) => {
    if (!course?.upload_date) return courseStatus.OLDER;
    
    const daysSinceUpload = Math.floor(
      (new Date() - new Date(course.upload_date)) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceUpload <= daysUntilNew) return courseStatus.NEW;
    if (daysSinceUpload <= daysUntilRecent) return courseStatus.RECENT;
    return courseStatus.OLDER;
  };
  
  /**
   * Computed greeting that updates in real-time
   */
  const greeting = computed(() => getGreeting());
  
  /**
   * Get formatted schedule for next upcoming class
   * @param {Object} classInfo - Class info object with schedule fields
   * @returns {string} Formatted schedule string
   */
  const getFormattedSchedule = (classInfo) => {
    if (!classInfo) return 'Schedule not set';
    
    const schedule1 = classInfo.schedule_day;
    const time1 = classInfo.schedule_time;
    const schedule2 = classInfo.schedule_day_2;
    const time2 = classInfo.schedule_time_2;
    
    // If no schedules exist
    if (!schedule1 && !schedule2) return 'Schedule not set';
    
    // If only one schedule exists, show it
    if (!schedule2 || !time2) {
      if (schedule1 && time1) {
        return `${schedule1}, ${formatTime(time1)}`;
      }
      return 'Schedule not set';
    }
    
    if (!schedule1 || !time1) {
      return `${schedule2}, ${formatTime(time2)}`;
    }
    
    // Both schedules exist - find the next upcoming one
    const today = new Date().getDay();
    const day1Num = dayToNumber[schedule1];
    const day2Num = dayToNumber[schedule2];
    
    // Calculate days until each schedule (0 = today, 7 = same day next week)
    const daysUntil1 = (day1Num - today + 7) % 7 || 7;
    const daysUntil2 = (day2Num - today + 7) % 7 || 7;
    
    // Show the schedule that comes sooner
    if (daysUntil1 <= daysUntil2) {
      return `${schedule1}, ${formatTime(time1)}`;
    } else {
      return `${schedule2}, ${formatTime(time2)}`;
    }
  };
  
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
    // Constants
    dayToNumber,
    placeholderImages,
    courseStatus,
    
    // Functions
    getGreeting,
    formatTime,
    getPlaceholderImage,
    getCourseStatus,
    getCourseStatusText,
    getStatusBadgeClass,
    getCourseStatusCustom,
    getFormattedSchedule,
    getDashboardCourses,
    
    // Computed
    greeting
  };
}
