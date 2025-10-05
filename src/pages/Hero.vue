<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
const images = ref([
  'https://media1.tenor.com/m/L1DyVjuyLqEAAAAd/uma-musume-dance.gif',
  'https://media1.tenor.com/m/wdgDOrbSkiwAAAAd/satono-diamond-diamond-satono.gif',
  'https://media1.tenor.com/m/I5QW13SdRhQAAAAd/zatoru-uma-musume.gif',
  'https://media1.tenor.com/m/j8Y254VBBU0AAAAC/satono-diamond-kitasan-black.gif'
]);

const currentImageIndex = ref(0);
let intervalId;
const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % images.value.length;
};
const goToImage = (index) => {
  currentImageIndex.value = index;
};
onMounted(() => {
  intervalId = setInterval(nextImage, 2000);
});
onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<template>
  <div class="relative bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:items-start lg:mt-[-50px]">
      <div>
        <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
          Tentukan Tujuanmu <br> Untuk Belajar <br> Bahasa Inggris
        </h1>
        <p class="mt-4 text-lg text-gray-700 leading-relaxed">
          Tentukan tujuan awal mengapa belajar bahasa Inggris. Mulai dari meneruskan sekolah ke luar negeri, karier profesional, ujian tes dan pengembangan diri.
        </p>
        <div class="mt-8 flex gap-4">
          <button class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors duration-300">
            Get Started
          </button>
          <button class="px-6 py-3 bg-white text-blue-600 border border-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors duration-300">
            Lihat Paket
          </button>
        </div>
      </div>

      <div class="relative w-full overflow-hidden rounded-lg shadow-2xl h-64 sm:h-80 lg:h-96 aspect-video max-w-lg lg:max-w-none mx-auto lg:mx-0">
        <TransitionGroup name="fade" tag="div" class="relative w-full h-full">
          <img
            v-for="(image, index) in images"
            :key="index"
            :src="image"
            :alt="`Hero Image ${index + 1}`"
            v-show="currentImageIndex === index"
            class="absolute top-0 left-0 w-full h-full object-cover"
          />
        </TransitionGroup>

        <div class="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
          <button
            v-for="(image, index) in images"
            :key="`dot-${index}`"
            @click="goToImage(index)"
            :class="[
              'w-3 h-3 rounded-full bg-white transition-all duration-300',
              currentImageIndex === index ? 'w-6 bg-blue-500' : 'opacity-70'
            ]"
            aria-label="Go to slide"
          ></button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* Memastikan elemen yang meninggalkan transisi tidak mengganggu yang masuk */
.fade-leave-active {
  position: absolute;
}
</style>