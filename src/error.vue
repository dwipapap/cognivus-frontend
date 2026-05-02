<script setup>
const props = defineProps({
  error: Object
});

const handleError = () => clearError({ redirect: '/' });

const errorTitle = computed(() => {
  if (props.error?.statusCode === 404) return 'Page Not Found';
  return 'An Error Occurred';
});

const errorMessage = computed(() => {
  if (props.error?.statusCode === 404) {
    return "Sorry, we couldn't find the page you're looking for.";
  }
  return props.error?.message || 'Something went wrong on our end.';
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
    <div class="max-w-md w-full text-center">
      <!-- Error Icon -->
      <div class="mb-8 flex justify-center">
        <div class="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
          <UIcon 
            :name="error?.statusCode === 404 ? 'i-solar-mask-haze-bold' : 'i-solar-danger-triangle-bold'" 
            class="w-12 h-12 text-red-600" 
          />
        </div>
      </div>

      <!-- Error Code -->
      <h1 class="text-6xl font-black text-gray-200 mb-2">{{ error?.statusCode || 500 }}</h1>
      
      <!-- Error Title -->
      <h2 class="text-3xl font-bold text-gray-900 mb-4">{{ errorTitle }}</h2>
      
      <!-- Error Message -->
      <p class="text-gray-600 mb-8">{{ errorMessage }}</p>

      <!-- Action Button -->
      <UButton
        size="xl"
        color="blue"
        variant="solid"
        class="rounded-full px-10 shadow-lg hover:shadow-xl transition-all"
        @click="handleError"
      >
        Go Back Home
      </UButton>

      <!-- Debug Info (Dev only) -->
      <div v-if="process.dev" class="mt-12 text-left p-4 bg-gray-100 rounded-lg overflow-auto max-h-40">
        <p class="text-xs font-mono text-gray-500">{{ error }}</p>
      </div>
    </div>
  </div>
</template>
