<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :required="required"
        @change="handleFileChange"
        class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      
      <!-- File info display -->
      <div v-if="selectedFile" class="mt-2 text-sm text-gray-600">
        <span class="font-medium">{{ selectedFile.name }}</span>
        <span class="ml-2 text-gray-500">({{ formatFileSize(selectedFile.size) }})</span>
      </div>
    </div>
    
    <!-- Error message -->
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    
    <!-- Help text -->
    <p v-if="hint" class="text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'BaseFileUpload',
  props: {
    /** Field label */
    label: String,
    /** Accepted file types (e.g., ".pdf,.doc") */
    accept: {
      type: String,
      default: '*'
    },
    /** Maximum file size in MB */
    maxSize: {
      type: Number,
      default: 10
    },
    /** Whether field is required */
    required: {
      type: Boolean,
      default: false
    },
    /** Error message */
    error: String,
    /** Help text */
    hint: String,
    /** Current file value */
    modelValue: File
  },
  emits: ['update:modelValue', 'error'],
  setup(props, { emit }) {
    const fileInput = ref(null);
    const selectedFile = ref(props.modelValue);

    /** Handle file selection */
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      
      if (!file) {
        selectedFile.value = null;
        emit('update:modelValue', null);
        return;
      }

      // Validate file size
      const maxBytes = props.maxSize * 1024 * 1024;
      if (file.size > maxBytes) {
        const errorMsg = `File exceeds ${props.maxSize}MB limit`;
        emit('error', errorMsg);
        fileInput.value.value = '';
        return;
      }

      selectedFile.value = file;
      emit('update:modelValue', file);
      emit('error', null);
    };

    /** Format file size for display */
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    /** Clear file input */
    const clear = () => {
      if (fileInput.value) {
        fileInput.value.value = '';
      }
      selectedFile.value = null;
      emit('update:modelValue', null);
    };

    // Watch for external value changes
    watch(() => props.modelValue, (newValue) => {
      selectedFile.value = newValue;
    });

    return {
      fileInput,
      selectedFile,
      handleFileChange,
      formatFileSize,
      clear
    };
  }
};
</script>
