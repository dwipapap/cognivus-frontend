<template>
  <section class="bg-white border-b-[3px] border-black py-10 md:py-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="reveal text-center max-w-3xl mx-auto">
        <div class="brutal-label mx-auto">TESTIMONI — 4.9/5</div>
        <h2 class="mt-3 text-[28px] md:text-[36px] font-black uppercase">Apa Kata Mereka</h2>
        <p class="mt-1 font-mono text-xs font-bold tracking-widest uppercase">ITTR ENGLISH COURSE • PEKANBARU</p>
      </div>
      <div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="reveal brutal-card lg:col-span-2 p-6 bg-[#DBEAFE]" data-delay="0">
          <div class="flex gap-1"><UIcon v-for="s in 5" :key="s" name="i-lucide-star" class="w-4 h-4 fill-black text-black" /></div>
          <p class="mt-3 text-lg md:text-xl font-black leading-tight uppercase">“Pengalaman belajar di ITTR sangat menyenangkan. Metodenya mudah dipahami dan instrukturnya sangat sabar.”</p>
          <div class="mt-4 border-t-[3px] border-black pt-3 flex items-center justify-between">
            <div><p class="text-sm font-black uppercase">[Nama Alumni]</p><p class="text-xs font-mono">[Program]</p></div>
            <span class="border-[3px] border-black bg-black text-white px-2 py-1 text-xs font-black">★★★★★</span>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="reveal brutal-card p-4 bg-white" data-delay="60">
            <div class="flex gap-1"><UIcon v-for="s in 5" :key="s" name="i-lucide-star" class="w-3.5 h-3.5 fill-black" /></div>
            <p class="mt-2 text-sm font-black uppercase leading-snug">“Setelah kursus di ITTR, saya berhasil dapat skor TOEFL impian!”</p>
            <p class="mt-2 text-xs font-bold">[Nama Alumni] — [Program]</p>
          </div>
          <div class="reveal brutal-card p-4 bg-white" data-delay="120">
            <div class="flex gap-1"><UIcon v-for="s in 5" :key="s" name="i-lucide-star" class="w-3.5 h-3.5 fill-black" /></div>
            <p class="mt-2 text-sm font-black uppercase leading-snug">“Kelas terjangkau dan berkualitas. Rekomendasi!”</p>
            <p class="mt-2 text-xs font-bold">[Nama Alumni] — [Program]</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>
