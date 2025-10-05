<script setup>
import { ref, onMounted } from 'vue';
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

onMounted(() => {
  fetchPrices();
  fetchOptions();
});
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-white mb-6">Classes Price</h1>

    <div class="mb-6 flex justify-end">
      <BaseButton @click="openAddModal" variant="glass-primary">
        + Add New Price
      </BaseButton>
    </div>

    <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-left text-gray-300">
          <thead class="text-xs text-gray-400 uppercase bg-gray-700">
            <tr>
              <th scope="col" class="px-6 py-3">Level</th>
              <th scope="col" class="px-6 py-3">Program</th>
              <th scope="col" class="px-6 py-3">Price</th>
              <th scope="col" class="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="4" class="text-center py-4">Loading data...</td>
            </tr>
            <tr v-else-if="prices.length === 0">
              <td colspan="4" class="text-center py-4">No prices found.</td>
            </tr>
            <tr v-for="priceItem in prices" :key="priceItem.priceid" class="border-b border-gray-700 hover:bg-gray-700">
              <td class="px-6 py-4 font-medium text-white">{{ getLevelName(priceItem.levelid) }}</td>
              <td class="px-6 py-4">{{ getProgramName(priceItem.programid) }}</td>
              <td class="px-6 py-4">{{ priceItem.harga || '-' }}</td>
              <td class="px-6 py-4 flex space-x-2">
                <button @click="openEditModal(priceItem)" class="font-medium text-blue-500 hover:underline">Edit</button>
                <button @click="handleDelete(priceItem)" class="font-medium text-red-500 hover:underline">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Modal :show="showFormModal" @close="showFormModal = false" :persistent="true" size="lg">
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

    <Modal :show="showNotificationModal" :type="notificationType" :message="notificationMessage" @close="showNotificationModal = false" />
  </div>
</template>
