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
        <!-- Loading State -->
    <div v-if="loading" class="max-w-2xl mx-auto py-20">
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
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, prices.length) }} of {{ prices.length }}
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
    <Modal :show="showFormModal" @close="showFormModal = false" :persistent="true" size="lg">
      <template #content>
        <h2 class="text-xl font-bold text-gray-800 mb-4">
          {{ isEditMode ? 'Edit Price' : 'Add New Price' }}
        </h2>
        <PriceForm
          :price-item="selectedPrice"
          :is-edit-mode="isEditMode"
          :levels="levels"
          :programs="programs"
          @close="showFormModal = false"
          @save="handleSave"
        />
      </template>
      <template #footer>
        <span></span>
      </template>
    </Modal>

    <!-- Notification Modal -->
    <Modal :show="showNotificationModal" :type="notificationType" :message="notificationMessage" @close="showNotificationModal = false" />
  </div>
</template>