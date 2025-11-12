<script setup>
import { ref, onMounted, computed } from 'vue';
import { priceAPI, levelAPI, programAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import PriceForm from './PriceForm.vue';

const prices = ref([]);
const levels = ref([]);
const programs = ref([]);
const isLoading = ref(true);
const showFormModal = ref(false);
const showNotificationModal = ref(false);
const notificationMessage = ref('');
const notificationType = ref('info');
const selectedPrice = ref(null);
const isEditMode = ref(false);
const currentPage = ref(1);
const itemsPerPage = 15;

/** Paginated prices */
const paginatedPrices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return prices.value.slice(start, end);
});

/** Total pages */
const totalPages = computed(() => {
  return Math.ceil(prices.value.length / itemsPerPage);
});

/** Go to specific page */
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

/** Format currency to IDR */
const formatCurrency = (amount) => {
  if (!amount) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

/** Get level name */
const getLevelName = (levelId) => {
  const level = levels.value.find(l => l.levelid === levelId);
  return level?.name || 'N/A';
};

/** Get program name */
const getProgramName = (programId) => {
  const program = programs.value.find(p => p.programid === programId);
  return program?.name || 'N/A';
};

/** Fetch all prices */
const fetchPrices = async () => {
  try {
    isLoading.value = true;
    const response = await priceAPI.getAllPrices();
    if (response.data.success) {
      prices.value = response.data.data;
    }
  } catch (error) {
    showNotification('error', 'Failed to load price data.');
  } finally {
    isLoading.value = false;
  }
};

/** Fetch dropdown options */
const fetchOptions = async () => {
  try {
    const [levelRes, programRes] = await Promise.all([
      levelAPI.getAllLevels(),
      programAPI.getAllPrograms()
    ]);
    
    if (levelRes.data.success) {
      levels.value = levelRes.data.data;
    }
    
    if (programRes.data.success) {
      programs.value = programRes.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch options:', error);
  }
};

/** Show notification */
const showNotification = (type, message) => {
  notificationType.value = type;
  notificationMessage.value = message;
  showNotificationModal.value = true;
};

/** Open add modal */
const openAddModal = () => {
  isEditMode.value = false;
  selectedPrice.value = null;
  showFormModal.value = true;
};

/** Open edit modal */
const openEditModal = (priceItem) => {
  isEditMode.value = true;
  selectedPrice.value = priceItem;
  showFormModal.value = true;
};

/** Handle save */
const handleSave = async (formData) => {
  try {
    if (isEditMode.value) {
      await priceAPI.updatePrice(selectedPrice.value.priceid, formData);
      showNotification('success', 'Price updated successfully.');
    } else {
      await priceAPI.createPrice(formData);
      showNotification('success', 'Price created successfully.');
    }
    showFormModal.value = false;
    fetchPrices();
  } catch (error) {
    const message = error.response?.data?.message || 'An error occurred.';
    showNotification('error', `Failed to save price: ${message}`);
  }
};

/** Delete price */
const handleDelete = async (priceItem) => {
  if (confirm(`Delete this price? This action cannot be undone.`)) {
    try {
      await priceAPI.deletePrice(priceItem.priceid);
      showNotification('success', 'Price deleted successfully.');
      fetchPrices();
    } catch (error) {
      showNotification('error', 'Failed to delete price.');
    }
  }
};

onMounted(() => {
  fetchPrices();
  fetchOptions();
});
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Classes Price</h1>
        <p class="text-gray-600 mt-1">Manage pricing for different levels and programs</p>
      </div>
      <BaseButton @click="openAddModal" variant="primary">
        <span class="mr-2">+</span> Add Price
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Prices Table -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">#</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Level</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Program</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Price</th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Monthly Price</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(priceItem, index) in paginatedPrices" 
              :key="priceItem.priceid"
              :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
              class="border-b border-gray-100 hover:bg-blue-50 transition-colors"
            >
              <!-- Row Number -->
              <td class="px-6 py-4 text-sm text-gray-500 text-right">
                {{ (currentPage - 1) * itemsPerPage + index + 1 }}
              </td>

              <!-- Level -->
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ getLevelName(priceItem.levelid) }}
                </span>
              </td>

              <!-- Program -->
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {{ getProgramName(priceItem.programid) }}
                </span>
              </td>

              <!-- Name -->
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {{ priceItem.name || '-' }}
              </td>

              <!-- Total Price -->
              <td class="px-6 py-4 text-right">
                <div class="text-sm font-semibold text-green-600">
                  {{ formatCurrency(priceItem.harga) }}
                </div>
              </td>

              <!-- Monthly Price -->
              <td class="px-6 py-4 text-right">
                <div class="text-sm font-semibold text-blue-600">
                  {{ formatCurrency(priceItem.monthlyprice) }}
                </div>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4">
                <div class="flex justify-center gap-2">
                  <BaseButton 
                    @click="openEditModal(priceItem)" 
                    variant="secondary"
                    size="sm"
                  >
                    Edit
                  </BaseButton>
                  <BaseButton 
                    @click="handleDelete(priceItem)" 
                    variant="danger"
                    size="sm"
                  >
                    Delete
                  </BaseButton>
                </div>
              </td>
            </tr>
            <tr v-if="prices.length === 0">
              <td colspan="7" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center justify-center text-gray-500">
                  <svg class="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-sm font-medium">No prices found</p>
                  <p class="text-xs mt-1">Click "Add Price" to create one.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <p class="text-sm text-gray-600">
          Showing <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to 
          <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, prices.length) }}</span> of 
          <span class="font-medium">{{ prices.length }}</span> prices
        </p>
        <div class="flex gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              currentPage === page
                ? 'bg-blue-600 text-white border border-blue-600'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <Modal 
      :show="showFormModal" 
      @close="showFormModal = false" 
      :persistent="true" 
      :title="isEditMode ? 'Edit Price' : 'Add New Price'"
      variant="gradient"
      size="5xl"
      :hide-footer="true"
    >
      <template #icon>
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </template>
      <template #content>
        <PriceForm
          :price-item="selectedPrice"
          :is-edit-mode="isEditMode"
          :levels="levels"
          :programs="programs"
          @close="showFormModal = false"
          @save="handleSave"
        />
      </template>
    </Modal>

    <!-- Notification Modal -->
    <Modal 
      :show="showNotificationModal" 
      :type="notificationType" 
      :message="notificationMessage" 
      variant="gradient"
      @close="showNotificationModal = false"
      :hide-footer="true"
    />
  </div>
</template>