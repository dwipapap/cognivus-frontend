import { ref, computed } from 'vue';

/**
 * Pagination Composable
 * Provides pagination logic for any array of items.
 * 
 * Features:
 * - Automatic page calculation
 * - Slice items for current page
 * - Navigation helpers (next, prev, goToPage)
 * - Reactive updates
 * 
 * Usage:
 *   const items = ref([...]);
 *   const { 
 *     currentPage, 
 *     paginatedItems, 
 *     totalPages,
 *     goToPage,
 *     nextPage,
 *     prevPage
 *   } = usePagination(items, 15);
 * 
 * @param {Ref<Array>} items - Reactive array of items to paginate
 * @param {number} itemsPerPage - Number of items per page (default: 15)
 * @returns {Object} Pagination state and methods
 */
export function usePagination(items, itemsPerPage = 15) {
  const currentPage = ref(1);

  /**
   * Get items for current page
   */
  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.value.slice(start, end);
  });

  /**
   * Calculate total number of pages
   */
  const totalPages = computed(() => {
    return Math.ceil(items.value.length / itemsPerPage);
  });

  /**
   * Check if there's a next page
   */
  const hasNextPage = computed(() => {
    return currentPage.value < totalPages.value;
  });

  /**
   * Check if there's a previous page
   */
  const hasPrevPage = computed(() => {
    return currentPage.value > 1;
  });

  /**
   * Navigate to specific page
   * @param {number} page - Target page number
   */
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  /**
   * Navigate to next page
   */
  const nextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++;
    }
  };

  /**
   * Navigate to previous page
   */
  const prevPage = () => {
    if (hasPrevPage.value) {
      currentPage.value--;
    }
  };

  /**
   * Reset to first page (useful after filtering)
   */
  const resetPage = () => {
    currentPage.value = 1;
  };

  return {
    // State
    currentPage,
    paginatedItems,
    totalPages,
    hasNextPage,
    hasPrevPage,

    // Methods
    goToPage,
    nextPage,
    prevPage,
    resetPage
  };
}

export default usePagination;
