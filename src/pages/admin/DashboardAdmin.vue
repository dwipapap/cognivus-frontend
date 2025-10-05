<template>
  <div>
    <h1 class="text-4xl font-bold text-white mb-4">Admin Dashboard</h1>
    <p class="text-gray-400 mb-8">Selamat datang di panel rahasia!</p>

    <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h2 class="text-2xl font-semibold text-white mb-4">Video Pelatihan Wajib</h2>
      <div class="aspect-w-16 aspect-h-9">
        <iframe
          class="w-full h-full rounded-lg"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Menambahkan rasio aspek untuk video embed */
.aspect-w-16 {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
}
.aspect-h-9 iframe {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}
</style>