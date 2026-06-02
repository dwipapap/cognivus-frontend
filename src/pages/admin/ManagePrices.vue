<script setup>
import { ref, onMounted, computed } from 'vue';
import { priceAPI, levelAPI, programAPI, ancillaryPriceAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import { useConfirm } from '@/composables/useConfirm'

import PriceForm from './PriceForm.vue';
import { formatCurrency } from '../../utils/formatters';

// Tab state
const activeTab = ref('0');
const tabItems = [
  { label: 'Classes', slot: 'classes' },
  { label: 'Ancillary', slot: 'ancillary' }
];

// Classes Price state
const prices = ref([]);
const levels = ref([]);
const programs = ref([]);
const isLoading = ref(true);
const showFormModal = ref(false);
const selectedPrice = ref(null);

const { open: confirmOpen, message: confirmMessage, confirm, onConfirm, onCancel } = useConfirm()
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
    toast.add({ title: 'Error', description: 'Failed to load price data.', color: 'error' });
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
    toast.add({ title: 'Error', description: 'Failed to load ancillary prices.', color: 'error' });
  } finally {
    isAncillaryLoading.value = false;
  }
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
      toast.add({ title: 'Success', description: 'Price updated successfully.', color: 'success' });
    } else {
      await priceAPI.createPrice(formData);
      toast.add({ title: 'Success', description: 'Price created successfully.', color: 'success' });
    }
    showFormModal.value = false;
    fetchPrices();
  } catch (error) {
    const message = error.response?.data?.message || 'An error occurred.';
    toast.add({ title: 'Error', description: `Failed to save price: ${message}`, color: 'error' });
  }
};

/** Delete class price */
const handleDelete = async (priceItem) => {
  if (await confirm(`Delete price for ${getLevelName(priceItem.levelid)} — ${getProgramName(priceItem.programid)}? This cannot be undone.`)) {
    try {
      await priceAPI.deletePrice(priceItem.priceid);
      toast.add({ title: 'Success', description: 'Price deleted successfully.', color: 'success' });
      fetchPrices();
    } catch (error) {
      toast.add({ title: 'Error', description: 'Failed to delete price.', color: 'error' });
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
      toast.add({ title: 'Success', description: 'Ancillary price updated.', color: 'success' });
    } else {
      await ancillaryPriceAPI.create(ancillaryForm.value);
      toast.add({ title: 'Success', description: 'Ancillary price created.', color: 'success' });
    }
    showAncillaryModal.value = false;
    fetchAncillaryPrices();
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to save ancillary price.', color: 'error' });
  }
};

const handleAncillaryDelete = async (item) => {
  if (await confirm(`Delete "${item.name}"? This cannot be undone.`)) {
    try {
      await ancillaryPriceAPI.delete(item.apid);
      toast.add({ title: 'Success', description: 'Ancillary price deleted.', color: 'success' });
      fetchAncillaryPrices();
    } catch (error) {
      toast.add({ title: 'Error', description: 'Failed to delete ancillary price.', color: 'error' });
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
        <h1 class="text-2xl font-bold text-default">Manage Prices</h1>
        <p class="text-toned mt-1">Manage class and ancillary pricing</p>
      </div>
      <UButton v-if="activeTab === '0'" @click="openAddModal" color="primary" variant="solid" icon="i-lucide-plus">
        Add Class Price
      </UButton>
      <UButton v-else @click="openAncillaryAddModal" color="primary" variant="solid" icon="i-lucide-plus">
        Add Ancillary Price
      </UButton>
    </div>

    <UTabs v-model="activeTab" :items="tabItems">
      <template #classes>
        <div v-if="isLoading" class="flex justify-center py-16">
          <UIcon name="i-lucide-loader-circle" class="w-8 h-8 animate-spin text-muted" />
        </div>

        <div v-else class="bg-default rounded-xl shadow-sm border border-default overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-muted border-b border-default">
                  <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider w-16">#</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider">Level</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider">Program
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider">Name</th>
                  <th class="px-6 py-4 text-right text-xs font-semibold text-default uppercase tracking-wider">Total
                    Price</th>
                  <th class="px-6 py-4 text-right text-xs font-semibold text-default uppercase tracking-wider">Monthly
                    Price</th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-default uppercase tracking-wider">Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(priceItem, index) in paginatedPrices" :key="priceItem.priceid"
                  :class="index % 2 === 0 ? 'bg-default' : 'bg-muted'"
                  class="border-b border-muted transition-colors">
                  <td class="px-6 py-4 text-sm text-muted text-right">
                    {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-default">
                      {{ getLevelName(priceItem.levelid) }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-default">
                      {{ getProgramName(priceItem.programid) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm font-medium text-default">{{ priceItem.name || '-' }}</td>
                  <td class="px-6 py-4 text-right text-sm font-semibold text-default">{{ formatCurrency(priceItem.harga)
                    }}</td>
                  <td class="px-6 py-4 text-right text-sm font-semibold text-default">{{
                    formatCurrency(priceItem.monthlyprice) }}</td>
                  <td class="px-6 py-4">
                    <div class="flex justify-center gap-2">
                      <UButton @click="openEditModal(priceItem)" color="primary" variant="solid" size="sm">Edit</UButton>
                      <UButton @click="handleDelete(priceItem)" color="error" variant="solid" size="sm">Delete</UButton>
                    </div>
                  </td>
                </tr>
                <tr v-if="prices.length === 0">
                  <td colspan="7" class="px-6 py-12 text-center text-muted">
                    <p class="text-sm font-medium">No class prices set up yet</p>
                    <p class="text-xs mt-1">Add one to get started.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="totalPages > 1"
            class="px-6 py-4 bg-muted border-t border-default flex items-center justify-between">
            <p class="text-sm text-toned">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, prices.length) }} of {{ prices.length }}
            </p>
            <UPagination v-model:page="currentPage" :total="prices.length" :max="itemsPerPage" :sibling-count="1" size="sm" />
          </div>
        </div>
      </template>

      <template #ancillary>
        <div v-if="isAncillaryLoading" class="flex justify-center py-16">
          <UIcon name="i-lucide-loader-circle" class="w-8 h-8 animate-spin text-muted" />
        </div>

      <div v-else class="bg-default rounded-xl shadow-sm border border-default overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-muted border-b border-default">
                <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider w-16">#</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider">Name</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider">Description
                </th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-default uppercase tracking-wider">Price</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-default uppercase tracking-wider">Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in ancillaryPrices" :key="item.apid"
                :class="index % 2 === 0 ? 'bg-default' : 'bg-muted'"
                class="border-b border-muted transition-colors">
                <td class="px-6 py-4 text-sm text-muted text-right">{{ index + 1 }}</td>
                <td class="px-6 py-4 text-sm font-medium text-default">{{ item.name }}</td>
                <td class="px-6 py-4 text-sm text-toned">{{ item.description || '-' }}</td>
                <td class="px-6 py-4 text-right text-sm font-semibold text-default">{{ formatCurrency(item.price) }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-center gap-2">
                    <UButton @click="openAncillaryEditModal(item)" color="primary" variant="solid" size="sm">Edit</UButton>
                    <UButton @click="handleAncillaryDelete(item)" color="error" variant="solid" size="sm">Delete</UButton>
                  </div>
                </td>
              </tr>
              <tr v-if="ancillaryPrices.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-muted">
                  <p class="text-sm font-medium">No ancillary prices yet</p>
                  <p class="text-xs mt-1">Add one to get started.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </template>
    </UTabs>

    <!-- Class Price Form Modal -->
    <Modal :show="showFormModal" @close="showFormModal = false" :persistent="true"
      :title="isEditMode ? 'Edit Price' : 'Add New Price'" size="5xl" :hide-footer="true">
      <template #icon>
        <UIcon name="i-lucide-tag" class="w-6 h-6 text-white" />
      </template>
      <template #content>
        <PriceForm :price-item="selectedPrice" :is-edit-mode="isEditMode" :levels="levels" :programs="programs"
          :prices="prices" @close="showFormModal = false" @save="handleSave" />
      </template>
    </Modal>

    <!-- Ancillary Price Form Modal -->
    <Modal :show="showAncillaryModal" @close="showAncillaryModal = false" :persistent="true"
      :title="isAncillaryEditMode ? 'Edit Ancillary Price' : 'Add Ancillary Price'" size="md"
      :hide-footer="true">
      <template #icon>
        <UIcon name="i-lucide-wallet" class="w-6 h-6 text-white" />
      </template>
      <template #content>
        <form @submit.prevent="handleAncillarySave" class="space-y-4">
          <UFormField label="Name" required>
            <UInput v-model="ancillaryForm.name" placeholder="e.g., Final Exam" />
          </UFormField>
          <UFormField label="Description">
            <UInput v-model="ancillaryForm.description" placeholder="Optional" />
          </UFormField>
          <UFormField label="Price" required>
            <UInput v-model="ancillaryForm.price" type="number" placeholder="e.g., 200000" />
          </UFormField>
          <div class="flex justify-end gap-3 pt-6 border-t border-default">
            <UButton type="button" color="neutral" variant="outline" @click="showAncillaryModal = false">Cancel</UButton>
            <UButton type="submit" color="primary" variant="solid" icon="i-lucide-check">
              {{ isAncillaryEditMode ? 'Update' : 'Create' }}
            </UButton>
          </div>
        </form>
      </template>
    </Modal>

  </div>

  <UModal v-model:open="confirmOpen" :title="confirmMessage">
    <template #footer>
      <UButton label="Cancel" color="neutral" variant="outline" @click="onCancel" />
      <UButton label="Delete" color="error" @click="onConfirm" />
    </template>
  </UModal>
</template>