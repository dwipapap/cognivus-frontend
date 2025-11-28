<script setup>
import { ref, computed, watch } from 'vue';
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

const props = defineProps({
  src: {
    type: String,
    required: true,
    default: ''
  }
});

const scale = ref(1);
const isLoading = ref(true);
const error = ref(null);

// Watermark configuration
const watermarkText = 'Property of ITTREnglish Course';
const watermarkOptions = {
  columns: 3,
  rows: 4,
  rotation: 45,
  fontSize: 15,
  color: 'rgba(100, 100, 100, 0.15)'
};

const { pdf, pages } = usePDF(props.src, {
  onProgress: ({ loaded, total }) => {
    if (loaded === total) {
      isLoading.value = false;
    }
  },
  onError: (reason) => {
    error.value = `Failed to load PDF: ${reason}`;
    isLoading.value = false;
  }
});

const zoomPercentage = computed(() => Math.round(scale.value * 100));

const canZoomIn = computed(() => scale.value < 2);
const canZoomOut = computed(() => scale.value > 0.5);

function zoomIn() {
  if (canZoomIn.value) {
    scale.value = Math.min(scale.value + 0.25, 2);
  }
}

function zoomOut() {
  if (canZoomOut.value) {
    scale.value = Math.max(scale.value - 0.25, 0.5);
  }
}

function resetZoom() {
  scale.value = 1;
}

watch(() => props.src, () => {
  isLoading.value = true;
  error.value = null;
  scale.value = 1;
});
</script>

<template>
  <div class="pdf-viewer-container flex flex-col h-full">
    <div class="sticky top-0 z-10 bg-white border-b border-gray-200 px-3 py-2 shadow-sm">
      <div class="flex items-center justify-end gap-2">
        <div class="flex items-center gap-1.5">
          <button
            @click="zoomOut"
            :disabled="!canZoomOut"
            class="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            :class="{ 'opacity-50': !canZoomOut }"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          
          <button
            @click="resetZoom"
            class="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors min-w-[70px]"
          >
            {{ zoomPercentage }}%
          </button>
          
          <button
            @click="zoomIn"
            :disabled="!canZoomIn"
            class="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            :class="{ 'opacity-50': !canZoomIn }"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto bg-gray-100 p-4">
      <LoadingSpinner 
        v-if="isLoading" 
        :overlay="false" 
        :center="true" 
        size="lg" 
        color="blue"
        text="Loading PDF..."
        class="py-12"
      />

      <div v-else-if="error" class="flex flex-col items-center justify-center py-12 text-center">
        <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-600 font-medium mb-2">Error Loading PDF</p>
        <p class="text-gray-600 text-sm">{{ error }}</p>
      </div>

      <div v-else class="flex flex-col items-center gap-4">
        <div 
          v-for="page in pages" 
          :key="page"
          class="bg-white shadow-lg rounded-lg overflow-hidden"
        >
          <VuePDF 
            :pdf="pdf" 
            :page="page" 
            :scale="scale"
            :watermark-text="watermarkText"
            :watermark-options="watermarkOptions"
            class="w-full"
          />
        </div>
        
        <div v-if="pages > 0" class="text-sm text-gray-600 py-2">
          Total: {{ pages }} {{ pages === 1 ? 'page' : 'pages' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pdf-viewer-container {
  height: 100%;
  min-height: 100%;
}

.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.7);
}
</style>
