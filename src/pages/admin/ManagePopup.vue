<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { popupAPI } from '../../services/api';
import { useConfirm } from '@/composables/useConfirm';

const popup = ref(null);
const isLoading = ref(true);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const toast = useToast();

const linkUrl = ref('');
const isActive = ref(true);
const selectedFile = ref(null);
const previewUrl = ref('');

const { open: confirmOpen, message: confirmMessage, confirm, onConfirm, onCancel } = useConfirm();

const fetchPopup = async () => {
  try {
    isLoading.value = true;
    const response = await popupAPI.get();
    popup.value = response.data.data;
    linkUrl.value = popup.value?.link_url || '';
    isActive.value = popup.value?.is_active ?? true;
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to load popup.', color: 'error' });
  } finally {
    isLoading.value = false;
  }
};

const handleFileChange = (e) => {
  const file = e.target.files?.[0] || null;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  selectedFile.value = file;
  previewUrl.value = file ? URL.createObjectURL(file) : '';
};

const handleSave = async () => {
  if (!popup.value && !selectedFile.value) {
    toast.add({ title: 'Error', description: 'An image is required to create a popup.', color: 'error' });
    return;
  }

  try {
    isSubmitting.value = true;
    await popupAPI.save({ link_url: linkUrl.value, is_active: isActive.value }, selectedFile.value);
    toast.add({ title: 'Success', description: 'Popup saved successfully!', color: 'success' });
    selectedFile.value = null;
    previewUrl.value = '';
    await fetchPopup();
  } catch (error) {
    toast.add({ title: 'Error', description: error.response?.data?.message || 'Failed to save popup.', color: 'error' });
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async () => {
  if (!await confirm('Delete the current popup? This will remove the image permanently.')) return;

  try {
    isDeleting.value = true;
    await popupAPI.remove();
    toast.add({ title: 'Success', description: 'Popup deleted successfully!', color: 'success' });
    await fetchPopup();
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to delete popup.', color: 'error' });
  } finally {
    isDeleting.value = false;
  }
};

onMounted(() => {
  fetchPopup();
});

onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-default tracking-tight">Popup</h1>
      <p class="text-sm text-muted mt-1">Photo popup shown to students on login</p>
    </div>

    <div v-if="isLoading" class="space-y-4 max-w-xl">
      <USkeleton class="h-48 w-full" />
      <USkeleton class="h-10 w-full" />
    </div>

    <div v-else class="space-y-6 max-w-xl">
      <UFormField label="Current Image">
        <div v-if="previewUrl || popup?.url" class="border border-default rounded-lg overflow-hidden">
          <img :src="previewUrl || popup.url" class="w-full max-h-80 object-contain bg-muted" />
        </div>
        <p v-else class="text-sm text-muted">No popup image uploaded yet.</p>
      </UFormField>

      <UFormField label="Upload Image" :hint="popup ? 'Uploading a new image replaces and deletes the current one' : ''">
        <UInput type="file" accept="image/*" @change="handleFileChange" />
      </UFormField>

      <UFormField label="Link URL" hint="Optional — opens in a new tab when the image is clicked">
        <UInput v-model="linkUrl" placeholder="https://example.com" />
      </UFormField>

      <UFormField label="Active">
        <USwitch v-model="isActive" />
      </UFormField>

      <div class="flex flex-wrap gap-3 pt-4 border-t border-default">
        <UButton color="primary" variant="solid" :loading="isSubmitting" icon="i-lucide-check" @click="handleSave">
          Save
        </UButton>
        <UButton v-if="popup" color="error" variant="outline" :loading="isDeleting" icon="i-lucide-trash-2" @click="handleDelete">
          Delete
        </UButton>
      </div>
    </div>

    <UModal v-model:open="confirmOpen" :title="confirmMessage">
      <template #footer>
        <UButton label="Cancel" color="neutral" variant="outline" @click="onCancel" />
        <UButton label="Delete" color="error" @click="onConfirm" />
      </template>
    </UModal>
  </div>
</template>
