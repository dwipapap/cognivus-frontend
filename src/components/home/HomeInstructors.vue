<template>
  <section class="bg-[#DBEAFE] border-y-[3px] border-black py-10 md:py-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto">
        <div class="inline-flex bg-black text-white px-3 py-1 font-black uppercase text-xs tracking-widest border-[3px] border-black">INSTRUCTORS — EXPERTS</div>
        <h2 class="mt-3 text-[28px] md:text-[36px] font-black uppercase leading-none">Meet Our <span class="bg-white border-[3px] border-black px-1">Instructors</span></h2>
        <p class="mt-2 text-sm font-medium">Certified, passionate and experienced — focused on your success.</p>
      </div>
      <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6 md:gap-8">
        <div v-for="(ins,i) in instructors" :key="i" class="reveal flex flex-col items-center text-center" :data-delay="String(i*40)">
          <div class="instructor-avatar h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 border-[3px] border-black overflow-hidden bg-white shadow-[4px_4px_0_#000]">
            <img :src="ins.image" :alt="ins.name" class="h-full w-full object-cover" loading="lazy" decoding="async" />
          </div>
          <div class="mt-3 border-[3px] border-black bg-black text-white px-3 py-2 w-full max-w-[180px] shadow-[3px_3px_0_#000]">
            <p class="text-[11px] font-black leading-tight uppercase line-clamp-2">{{ ins.name }}</p>
            <p class="text-[10px] font-mono font-bold tracking-widest text-[#DBEAFE]">EXAMINER</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const instructors = [
  { name: 'Ms. Novella Putri Lerian, S.I.P., M.Si', image: '/instructor/novella.png' },
  { name: 'Mr. Erdi Tanjung', image: '/instructor/erdi-tanjung.png' },
  { name: 'Mr. Sabri Sulaiman, S.Pd', image: '/instructor/sabri.png' },
  { name: 'Mr. Rizal, S.Pd', image: '/instructor/rizal.png' },
  { name: 'Mrs. Lisa, S.Pd', image: '/instructor/lisa.png' },
  { name: 'Ms. Ushwatul Jannah, S.I.P., M.Si', image: '/instructor/ushwatul.png' },
  { name: 'Ms. Silviana, S.Pd', image: '/instructor/silviana.png' },
  { name: 'Mr. Rahmat, S.Pd', image: '/instructor/rahmat.png' }
]
</script>
