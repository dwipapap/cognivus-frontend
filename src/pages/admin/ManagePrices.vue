<script setup>
import { ref, onMounted, computed } from 'vue';
import { priceAPI, levelAPI, programAPI, ancillaryPriceAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseInput from '../../components/form/BaseInput.vue';
import PriceForm from './PriceForm.vue';
import { formatCurrency } from '../../utils/formatters';

// Tab state
const activeTab = ref('classes');

// Classes Price state
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

// Ancillary Price state
const ancillaryPrices = ref([]);
const isAncillaryLoading = ref(true);
const showAncillaryModal = ref(false);
const selectedAncillary = ref(null);
const isAncillaryEditMode = ref(false);
const ancillaryForm = ref({ name: '', description: '', price: '' });

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

/** Fetch ancillary prices */
const fetchAncillaryPrices = async () => {
  try {
    isAncillaryLoading.value = true;
    const response = await ancillaryPriceAPI.getAll();
    if (response.data.success) {
      ancillaryPrices.value = response.data.data;
    }
  } catch (error) {
    showNotification('error', 'Failed to load ancillary prices.');
  } finally {
    isAncillaryLoading.value = false;
  }
};

/** Show notification */
const showNotification = (type, message) => {
  notificationType.value = type;
  notificationMessage.value = message;
  showNotificationModal.value = true;
};

/** Open add modal for class price */
const openAddModal = () => {
  isEditMode.value = false;
  selectedPrice.value = null;
  showFormModal.value = true;
};

/** Open edit modal for class price */
const openEditModal = (priceItem) => {
  isEditMode.value = true;
  selectedPrice.value = priceItem;
  showFormModal.value = true;
};

/** Handle save for class price */
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

/** Delete class price */
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

// Ancillary Price Methods
const openAncillaryAddModal = () => {
  isAncillaryEditMode.value = false;
  selectedAncillary.value = null;
  ancillaryForm.value = { name: '', description: '', price: '' };
  showAncillaryModal.value = true;
};

const openAncillaryEditModal = (item) => {
  isAncillaryEditMode.value = true;
  selectedAncillary.value = item;
  ancillaryForm.value = {
    name: item.name || '',
    description: item.description || '',
    price: item.price || ''
  };
  showAncillaryModal.value = true;
};

const handleAncillarySave = async () => {
  try {
    if (isAncillaryEditMode.value) {
      await ancillaryPriceAPI.update(selectedAncillary.value.apid, ancillaryForm.value);
      showNotification('success', 'Ancillary price updated.');
    } else {
      await ancillaryPriceAPI.create(ancillaryForm.value);
      showNotification('success', 'Ancillary price created.');
    }
    showAncillaryModal.value = false;
    fetchAncillaryPrices();
  } catch (error) {
    showNotification('error', 'Failed to save ancillary price.');
  }
};

const handleAncillaryDelete = async (item) => {
  if (confirm(`Delete "${item.name}"? This cannot be undone.`)) {
    try {
      await ancillaryPriceAPI.delete(item.apid);
      showNotification('success', 'Ancillary price deleted.');
      fetchAncillaryPrices();
    } catch (error) {
      showNotification('error', 'Failed to delete ancillary price.');
    }
  }
};

onMounted(() => {
  fetchPrices();
  fetchOptions();
  fetchAncillaryPrices();
});
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Manage Prices</h1>
        <p class="text-gray-600 mt-1">Manage class and ancillary pricing</p>
      </div>
      <BaseButton v-if="activeTab === 'classes'" @click="openAddModal" variant="primary">
        <span class="mr-2">+</span> Add Class Price
      </BaseButton>
      <BaseButton v-else @click="openAncillaryAddModal" variant="primary">
        <span class="mr-2">+</span> Add Ancillary Price
      </BaseButton>
    </div>

    <!-- Tab Navigation -->
    <div class="flex border-b border-gray-200 mb-6">
      <button @click="activeTab = 'classes'" :class="[
        'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
        activeTab === 'classes'
          ? 'text-blue-600 border-blue-600'
          : 'text-gray-500 border-transparent hover:text-gray-700'
      ]">
        Classes Price
      </button>
      <button @click="activeTab = 'ancillary'" :class="[
        'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
        activeTab === 'ancillary'
          ? 'text-blue-600 border-blue-600'
          : 'text-gray-500 border-transparent hover:text-gray-700'
      ]">
        Ancillary Price
      </button>
    </div>

    <!-- Classes Price Tab Content -->
    <div v-if="activeTab === 'classes'">
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">#</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Level</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Program
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total
                  Price</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Monthly
                  Price</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(priceItem, index) in paginatedPrices" :key="priceItem.priceid"
                :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                class="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                <td class="px-6 py-4 text-sm text-gray-500 text-right">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ getLevelName(priceItem.levelid) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {{ getProgramName(priceItem.programid) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ priceItem.name || '-' }}</td>
                <td class="px-6 py-4 text-right text-sm font-semibold text-green-600">{{ formatCurrency(priceItem.harga)
                  }}</td>
                <td class="px-6 py-4 text-right text-sm font-semibold text-blue-600">{{
                  formatCurrency(priceItem.monthlyprice) }}</td>
                <td class="px-6 py-4">
                  <div class="flex justify-center gap-2">
                    <BaseButton @click="openEditModal(priceItem)" variant="secondary" size="sm">Edit</BaseButton>
                    <BaseButton @click="handleDelete(priceItem)" variant="danger" size="sm">Delete</BaseButton>
                  </div>
                </td>
              </tr>
              <tr v-if="prices.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                  <p class="text-sm font-medium">No prices found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1"
          class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <p class="text-sm text-gray-600">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, prices.length)
            }} of {{ prices.length }}
          </p>
          <div class="flex gap-2">
            <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Previous
            </button>
            <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Ancillary Price Tab Content -->
    <div v-else>
      <div v-if="isAncillaryLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">#</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description
                </th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in ancillaryPrices" :key="item.apid"
                :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                class="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                <td class="px-6 py-4 text-sm text-gray-500 text-right">{{ index + 1 }}</td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ item.name }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ item.description || '-' }}</td>
                <td class="px-6 py-4 text-right text-sm font-semibold text-green-600">{{ formatCurrency(item.price) }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-center gap-2">
                    <BaseButton @click="openAncillaryEditModal(item)" variant="secondary" size="sm">Edit</BaseButton>
                    <BaseButton @click="handleAncillaryDelete(item)" variant="danger" size="sm">Delete</BaseButton>
                  </div>
                </td>
              </tr>
              <tr v-if="ancillaryPrices.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  <p class="text-sm font-medium">No ancillary prices found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Class Price Form Modal -->
    <Modal :show="showFormModal" @close="showFormModal = false" :persistent="true"
      :title="isEditMode ? 'Edit Price' : 'Add New Price'" variant="gradient" size="5xl" :hide-footer="true">
      <template #icon>
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </template>
      <template #content>
        <PriceForm :price-item="selectedPrice" :is-edit-mode="isEditMode" :levels="levels" :programs="programs"
          :prices="prices" @close="showFormModal = false" @save="handleSave" />
      </template>
    </Modal>

    <!-- Ancillary Price Form Modal -->
    <Modal :show="showAncillaryModal" @close="showAncillaryModal = false" :persistent="true"
      :title="isAncillaryEditMode ? 'Edit Ancillary Price' : 'Add Ancillary Price'" variant="gradient" size="md"
      :hide-footer="true">
      <template #icon>
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
      </template>
      <template #content>
        <form @submit.prevent="handleAncillarySave" class="space-y-4">
          <BaseInput v-model="ancillaryForm.name" label="Name" placeholder="e.g., Final Exam" required />
          <BaseInput v-model="ancillaryForm.description" label="Description" placeholder="Fee description" />
          <BaseInput v-model="ancillaryForm.price" label="Price" type="number" placeholder="e.g., 200000" required />
          <div class="flex justify-end gap-3 pt-4">
            <BaseButton type="button" variant="secondary" @click="showAncillaryModal = false">Cancel</BaseButton>
            <BaseButton type="submit" variant="primary">{{ isAncillaryEditMode ? 'Update' : 'Create' }}</BaseButton>
          </div>
        </form>
      </template>
    </Modal>

    <!-- Notification Modal -->
    <Modal :show="showNotificationModal" :type="notificationType" :message="notificationMessage" variant="gradient"
      @close="showNotificationModal = false" :hide-footer="true" />
  </div>
</template>