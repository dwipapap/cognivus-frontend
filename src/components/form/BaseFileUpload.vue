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
        :multiple="multiple"
        @change="handleFileChange"
        class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      
      <!-- Single file display -->
      <div v-if="!multiple && selectedFile" class="mt-2 text-sm text-gray-600">
        <span class="font-medium">{{ selectedFile.name }}</span>
        <span class="ml-2 text-gray-500">({{ formatFileSize(selectedFile.size) }})</span>
      </div>

      <!-- Multiple files display -->
      <div v-if="multiple && selectedFiles.length > 0" class="mt-2 space-y-1">
        <div v-for="(file, idx) in selectedFiles" :key="idx" class="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <div>
            <span class="font-medium">{{ file.name }}</span>
            <span class="ml-2 text-gray-500">({{ formatFileSize(file.size) }})</span>
          </div>
          <button @click="removeFile(idx)" type="button" class="text-red-600 hover:text-red-800 text-xs">
            Remove
          </button>
        </div>
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
    /** Allow multiple files */
    multiple: {
      type: Boolean,
      default: false
    },
    /** Error message */
    error: String,
    /** Help text */
    hint: String,
    /** Current file value (File or Array<File>) */
    modelValue: [File, Array]
  },
  emits: ['update:modelValue', 'error'],
  setup(props, { emit }) {
    const fileInput = ref(null);
    const selectedFile = ref(props.multiple ? null : props.modelValue);
    const selectedFiles = ref(props.multiple ? (props.modelValue || []) : []);

    /** Handle file selection */
    const handleFileChange = (event) => {
      const files = Array.from(event.target.files);
      
      if (!files.length) {
        if (props.multiple) {
          selectedFiles.value = [];
          emit('update:modelValue', []);
        } else {
          selectedFile.value = null;
          emit('update:modelValue', null);
        }
        return;
      }

      // Validate file sizes
      const maxBytes = props.maxSize * 1024 * 1024;
      const oversizedFiles = files.filter(f => f.size > maxBytes);
      
      if (oversizedFiles.length > 0) {
        const errorMsg = `${oversizedFiles.length} file(s) exceed ${props.maxSize}MB limit`;
        emit('error', errorMsg);
        fileInput.value.value = '';
        return;
      }

      if (props.multiple) {
        selectedFiles.value = files;
        emit('update:modelValue', files);
      } else {
        selectedFile.value = files[0];
        emit('update:modelValue', files[0]);
      }
      
      emit('error', null);
    };

    /** Remove file from multiple selection */
    const removeFile = (index) => {
      selectedFiles.value.splice(index, 1);
      emit('update:modelValue', selectedFiles.value);
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
      if (props.multiple) {
        selectedFiles.value = [];
        emit('update:modelValue', []);
      } else {
        selectedFile.value = null;
        emit('update:modelValue', null);
      }
    };

    // Watch for external value changes
    watch(() => props.modelValue, (newValue) => {
      if (props.multiple) {
        selectedFiles.value = newValue || [];
      } else {
        selectedFile.value = newValue;
      }
    });

    return {
      fileInput,
      selectedFile,
      selectedFiles,
      handleFileChange,
      removeFile,
      formatFileSize,
      clear
    };
  }
};
</script>
