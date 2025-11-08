import { ref } from 'vue';
import { logger } from '../utils/logger';

/**
 * CRUD Table Composable
 * Provides common CRUD operations and state management for admin tables.
 * 
 * Features:
 * - Fetch, create, update, delete operations
 * - Loading states
 * - Modal management
 * - Error handling
 * - Notifications
 * 
 * Usage:
 *   const { 
 *     items, 
 *     isLoading,
 *     showFormModal,
 *     selectedItem,
 *     isEditMode,
 *     fetchItems,
 *     handleSave,
 *     handleDelete,
 *     openAddModal,
 *     openEditModal,
 *     closeModal
 *   } = useCrudTable(studentAPI, {
 *     resourceName: 'student',
 *     idField: 'studentid'
 *   });
 * 
 * @param {Object} apiService - API service object with CRUD methods
 * @param {Object} options - Configuration options
 * @returns {Object} CRUD state and methods
 */
export function useCrudTable(apiService, options = {}) {
  const {
    resourceName = 'item',
    idField = 'id',
    onSuccess = null,
    onError = null
  } = options;

  // State
  const items = ref([]);
  const isLoading = ref(false);
  const showFormModal = ref(false);
  const showNotificationModal = ref(false);
  const notificationMessage = ref('');
  const notificationType = ref('info');
  const selectedItem = ref(null);
  const isEditMode = ref(false);

  /**
   * Show notification
   * @param {string} type - Notification type (success, error, info, warning)
   * @param {string} message - Notification message
   */
  const showNotification = (type, message) => {
    notificationType.value = type;
    notificationMessage.value = message;
    showNotificationModal.value = true;

    if (onSuccess && type === 'success') {
      onSuccess(message);
    }
    if (onError && type === 'error') {
      onError(message);
    }
  };

  /**
   * Fetch all items from API
   */
  const fetchItems = async () => {
    try {
      isLoading.value = true;
      const response = await apiService.getAlls?.() || await apiService.getAll?.();
      
      if (response?.data?.success) {
        items.value = response.data.data;
        logger.log(`✅ Fetched ${items.value.length} ${resourceName}s`);
      }
    } catch (error) {
      logger.error(`Failed to load ${resourceName} data:`, error);
      showNotification('error', `Failed to load ${resourceName} data.`);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Open modal for adding new item
   */
  const openAddModal = () => {
    isEditMode.value = false;
    selectedItem.value = null;
    showFormModal.value = true;
  };

  /**
   * Open modal for editing existing item
   * @param {Object} item - Item to edit
   */
  const openEditModal = (item) => {
    isEditMode.value = true;
    selectedItem.value = item;
    showFormModal.value = true;
  };

  /**
   * Close form modal
   */
  const closeModal = () => {
    showFormModal.value = false;
    selectedItem.value = null;
    isEditMode.value = false;
  };

  /**
   * Handle save (create or update)
   * @param {Object} formData - Form data to save
   */
  const handleSave = async (formData) => {
    try {
      if (isEditMode.value) {
        // Update existing item
        const itemId = selectedItem.value[idField];
        await apiService.update?.(itemId, formData) || 
              await apiService[`update${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}`]?.(itemId, formData);
        
        showNotification('success', `${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} updated successfully!`);
      } else {
        // Create new item
        await apiService.create?.(formData) || 
              await apiService[`create${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}`]?.(formData);
        
        showNotification('success', `${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} created successfully!`);
      }
      
      closeModal();
      await fetchItems();
    } catch (error) {
      logger.error(`Failed to save ${resourceName}:`, error);
      const message = error.response?.data?.message || 'An error occurred.';
      showNotification('error', `Failed to save ${resourceName}: ${message}`);
    }
  };

  /**
   * Handle delete with confirmation
   * @param {Object} item - Item to delete
   * @param {string} confirmMessage - Custom confirmation message
   */
  const handleDelete = async (item, confirmMessage = null) => {
    const itemName = item.fullname || item.name || item.title || `this ${resourceName}`;
    const message = confirmMessage || `Are you sure you want to delete ${itemName}? This action cannot be undone.`;
    
    if (!confirm(message)) {
      return;
    }

    try {
      const itemId = item[idField];
      await apiService.delete?.(itemId) || 
            await apiService[`delete${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}`]?.(itemId);
      
      showNotification('success', `${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} deleted successfully.`);
      await fetchItems();
    } catch (error) {
      logger.error(`Failed to delete ${resourceName}:`, error);
      showNotification('error', `Failed to delete ${resourceName}.`);
    }
  };

  return {
    // State
    items,
    isLoading,
    showFormModal,
    showNotificationModal,
    notificationMessage,
    notificationType,
    selectedItem,
    isEditMode,

    // Methods
    fetchItems,
    openAddModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
    showNotification
  };
}

export default useCrudTable;
