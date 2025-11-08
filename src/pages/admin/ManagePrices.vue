<script setup>
import { ref, onMounted } from 'vue';
import { priceAPI, levelAPI, programAPI } from '../../services/api';
import { useCrudTable } from '../../composables/useCrudTable';
import { usePagination } from '../../composables/usePagination';
import { logger } from '../../utils/logger';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import LoadingBar from '../../components/ui/LoadingBar.vue';
import PriceForm from './PriceForm.vue';

// Wrap priceAPI to match useCrudTable interface
const priceCrudAPI = {
  getAll: priceAPI.getAllPrices,
  create: priceAPI.createPrice,
  update: priceAPI.updatePrice,
  delete: priceAPI.deletePrice
};

// Use CRUD composable for prices
const {
  items: prices,
  isLoading,
  showFormModal,
  showNotificationModal,
  notificationMessage,
  notificationType,
  selectedItem: selectedPrice,
  isEditMode,
  fetchItems: fetchPrices,
  openAddModal,
  openEditModal,
  handleSave,
  handleDelete
} = useCrudTable(priceCrudAPI, {
  resourceName: 'price',
  idField: 'priceid'
});

// Use pagination composable
const {
  paginatedItems: paginatedPrices,
  currentPage,
  totalPages,
  goToPage
} = usePagination(prices, 15);

// Reference data for dropdowns
const levels = ref([]);
const programs = ref([]);

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
    logger.error('Failed to fetch options:', error);
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
    <div v-if="isLoading" class="max-w-2xl mx-auto py-20">
      <LoadingBar :loading="true" color="blue" :duration="2000" />
      <p class="text-center text-gray-600 mt-4">Loading prices...</p>
    </div>

    <!-- Prices Table -->
    <div v-else class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Level</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Program</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Price</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Monthly Price</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="priceItem in paginatedPrices" :key="priceItem.priceid" class="hover:bg-blue-50 transition-colors">
              <!-- Level -->
              <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ getLevelName(priceItem.levelid) }}
                </span>
              </td>

              <!-- Program -->
              <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                  {{ getProgramName(priceItem.programid) }}
                </span>
              </td>

              <!-- Name -->
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ priceItem.name || '-' }}
              </td>

              <!-- Total Price -->
              <td class="px-6 py-4">
                <div class="text-sm font-semibold text-green-600">
                  {{ formatCurrency(priceItem.harga) }}
                </div>
              </td>

              <!-- Monthly Price -->
              <td class="px-6 py-4">
                <div class="text-sm font-semibold text-blue-600">
                  {{ formatCurrency(priceItem.monthlyprice) }}
                </div>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-sm">
                <div class="flex gap-2">
                  <button @click="openEditModal(priceItem)" class="text-blue-600 hover:text-blue-800 font-medium">
                    Edit
                  </button>
                  <button @click="handleDelete(priceItem)" class="text-red-600 hover:text-red-800 font-medium">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="prices.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                No prices found. Click "Add Price" to create one.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <p class="text-sm text-gray-600">
          Showing {{ (currentPage - 1) * 15 + 1 }} to {{ Math.min(currentPage * 15, prices.length) }} of {{ prices.length }}
        </p>
        <div class="flex gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-1 border rounded-lg text-sm',
              currentPage === page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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