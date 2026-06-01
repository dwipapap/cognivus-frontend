<template>
  <section class="bg-cream py-16 md:py-24">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="reveal text-center max-w-3xl mx-auto mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-default leading-tight">
          Testimoni
        </h2>
        <p class="mt-3 text-lg text-muted">Apa kata mereka tentang ITTR English Course</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="reveal lg:col-span-3 bg-white rounded-2xl p-8 md:p-10 shadow-md"
             data-delay="0">
          <div class="flex gap-1 mb-4">
            <UIcon v-for="s in 5" :key="s" name="i-lucide-star" class="w-5 h-5 text-sun-yellow" />
          </div>
          <p class="text-2xl font-bold text-default leading-snug mb-6 italic">
            "Pengalaman belajar di ITTR sangat menyenangkan. Metode pengajarannya mudah dipahami dan instrukturnya sangat sabar."
          </p>
          <div>
            <p class="font-bold text-default">[Nama Alumni]</p>
            <p class="text-sm text-muted">[Program yang diikuti]</p>
          </div>
        </div>

        <div class="lg:col-span-2 flex flex-col gap-6">
          <div class="reveal bg-white rounded-2xl p-6 shadow-md"
               data-delay="60">
             <div class="flex gap-1 mb-3">
              <UIcon v-for="s in 5" :key="s" name="i-lucide-star" class="w-4 h-4 text-sun-yellow" />
            </div>
            <p class="text-base font-semibold text-default leading-relaxed mb-4 italic">
              "Setelah kursus di ITTR, saya berhasil mendapatkan skor TOEFL yang saya impikan. Terima kasih ITTR!"
            </p>
            <div>
              <p class="font-semibold text-default text-sm">[Nama Alumni]</p>
              <p class="text-xs text-muted">[Program yang diikuti]</p>
            </div>
          </div>

          <div class="reveal bg-white rounded-2xl p-6 shadow-md"
               data-delay="120">
                         <div class="flex gap-1 mb-3">
              <UIcon v-for="s in 5" :key="s" name="i-lucide-star" class="w-4 h-4 text-sun-yellow" />
            </div>
            <p class="text-base font-semibold text-default leading-relaxed mb-4 italic">
              "Kelas di ITTR sangat terjangkau dan berkualitas. Saya merekomendasikan ITTR untuk siapa saja yang ingin belajar bahasa Inggris."
            </p>
            <div>
              <p class="font-semibold text-default text-sm">[Nama Alumni]</p>
              <p class="text-xs text-muted">[Program yang diikuti]</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>
