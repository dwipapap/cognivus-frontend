<script setup>
import { useAuthStore } from '~/store/auth';

const auth = useAuthStore();

onMounted(() => {
  auth.init();
});
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
