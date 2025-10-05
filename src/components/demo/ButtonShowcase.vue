<script setup>
import BaseButton from '../ui/BaseButton.vue';
import { ref } from 'vue';

const isLoading = ref(false);

const handleClick = (variant) => {
  console.log(`Clicked ${variant} button`);
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
  }, 2000);
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-white mb-8 text-center">
        Glassmorphism Button Showcase
      </h1>
      
      <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30">
        <div class="grid gap-6">
          
          <!-- Basic Glass Buttons -->
          <div class="space-y-4">
            <h2 class="text-2xl font-semibold text-white mb-4">Basic Glass Variants</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BaseButton 
                variant="glass" 
                size="lg"
                @click="handleClick('glass')"
              >
                <template #icon>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </template>
                Glass Button
              </BaseButton>
              
              <BaseButton 
                variant="glass-primary" 
                size="lg"
                @click="handleClick('glass-primary')"
              >
                Glass Primary
              </BaseButton>
              
              <BaseButton 
                variant="glass-secondary" 
                size="lg"
                @click="handleClick('glass-secondary')"
              >
                Glass Secondary
              </BaseButton>
            </div>
          </div>

          <!-- Gradient Button -->
          <div class="space-y-4">
            <h2 class="text-2xl font-semibold text-white mb-4">Gradient Variant</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BaseButton 
                variant="gradient" 
                size="lg"
                @click="handleClick('gradient')"
              >
                <template #icon>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                  </svg>
                </template>
                Gradient Magic
              </BaseButton>
              
              <BaseButton 
                variant="gradient" 
                size="lg"
                :loading="isLoading"
                @click="handleClick('gradient-loading')"
              >
                Loading State
              </BaseButton>
            </div>
          </div>

          <!-- Different Sizes -->
          <div class="space-y-4">
            <h2 class="text-2xl font-semibold text-white mb-4">Different Sizes</h2>
            <div class="flex flex-wrap items-center gap-4">
              <BaseButton variant="glass-primary" size="xs">XS</BaseButton>
              <BaseButton variant="glass-primary" size="sm">Small</BaseButton>
              <BaseButton variant="glass-primary" size="md">Medium</BaseButton>
              <BaseButton variant="glass-primary" size="lg">Large</BaseButton>
              <BaseButton variant="glass-primary" size="xl">Extra Large</BaseButton>
            </div>
          </div>

          <!-- Block Buttons -->
          <div class="space-y-4">
            <h2 class="text-2xl font-semibold text-white mb-4">Block Buttons</h2>
            <div class="space-y-3">
              <BaseButton variant="glass" size="lg" block>
                Full Width Glass
              </BaseButton>
              <BaseButton variant="glass-primary" size="lg" block>
                Full Width Primary
              </BaseButton>
              <BaseButton variant="gradient" size="lg" block>
                <template #icon>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </template>
                Full Width Gradient with Icon
              </BaseButton>
            </div>
          </div>

          <!-- Disabled States -->
          <div class="space-y-4">
            <h2 class="text-2xl font-semibold text-white mb-4">Disabled States</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BaseButton variant="glass" size="lg" disabled>
                Disabled Glass
              </BaseButton>
              <BaseButton variant="glass-primary" size="lg" disabled>
                Disabled Primary
              </BaseButton>
              <BaseButton variant="gradient" size="lg" disabled>
                Disabled Gradient
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional demo styles if needed */
</style>