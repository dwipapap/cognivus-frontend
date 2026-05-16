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
  <div class="min-h-screen bg-surface-canvas p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-ink mb-8 text-center">
        Button Component Showcase
      </h1>

      <div class="space-y-8">
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold text-ink mb-4">Solid Variants</h2>
          <div class="flex flex-wrap gap-4">
            <BaseButton variant="primary" size="lg" @click="handleClick('primary')">Primary</BaseButton>
            <BaseButton variant="secondary" size="lg" @click="handleClick('secondary')">Secondary</BaseButton>
            <BaseButton variant="success" size="lg" @click="handleClick('success')">Success</BaseButton>
            <BaseButton variant="danger" size="lg" @click="handleClick('danger')">Danger</BaseButton>
            <BaseButton variant="warning" size="lg" @click="handleClick('warning')">Warning</BaseButton>
            <BaseButton variant="info" size="lg" @click="handleClick('info')">Info</BaseButton>
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-2xl font-semibold text-ink mb-4">Different Sizes</h2>
          <div class="flex flex-wrap items-center gap-4">
            <BaseButton variant="primary" size="xs">XS</BaseButton>
            <BaseButton variant="primary" size="sm">Small</BaseButton>
            <BaseButton variant="primary" size="md">Medium</BaseButton>
            <BaseButton variant="primary" size="lg">Large</BaseButton>
            <BaseButton variant="primary" size="xl">Extra Large</BaseButton>
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-2xl font-semibold text-ink mb-4">Block Buttons</h2>
          <div class="space-y-3">
            <BaseButton variant="primary" size="lg" block>Full Width Primary</BaseButton>
            <BaseButton variant="secondary" size="lg" block>Full Width Secondary</BaseButton>
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-2xl font-semibold text-ink mb-4">Loading States</h2>
          <div class="flex flex-wrap gap-4">
            <BaseButton variant="primary" size="lg" :loading="isLoading" @click="handleClick('primary-loading')">Loading Primary</BaseButton>
            <BaseButton variant="secondary" size="lg" :loading="isLoading" @click="handleClick('secondary-loading')">Loading Secondary</BaseButton>
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-2xl font-semibold text-ink mb-4">Disabled States</h2>
          <div class="flex flex-wrap gap-4">
            <BaseButton variant="primary" size="lg" disabled>Disabled Primary</BaseButton>
            <BaseButton variant="secondary" size="lg" disabled>Disabled Secondary</BaseButton>
            <BaseButton variant="success" size="lg" disabled>Disabled Success</BaseButton>
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-2xl font-semibold text-ink mb-4">With Icons</h2>
          <div class="flex flex-wrap gap-4">
            <BaseButton variant="primary" size="lg" @click="handleClick('icon-left')">
              <template #icon>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </template>
              Left Icon
            </BaseButton>
            <BaseButton variant="primary" size="lg" icon-position="right" @click="handleClick('icon-right')">
              Right Icon
              <template #icon>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m0-7H3"></path>
                </svg>
              </template>
            </BaseButton>
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-2xl font-semibold text-ink mb-4">Link Variant</h2>
          <BaseButton variant="link" @click="handleClick('link')">Text Link Button</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
