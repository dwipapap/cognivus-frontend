<template>
  <section class="bg-[#EFF4FF] border-b-[3px] border-black py-10 md:py-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="reveal flex items-end justify-between gap-4">
        <h2 class="text-[26px] md:text-[32px] font-black uppercase leading-none">Learning<br/><span class="bg-black text-white px-1">by Level</span></h2>
        <span class="hidden md:inline brutal-label">3 OPTIONS • LMS READY</span>
      </div>
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="(p,i) in programs" :key="i" class="reveal brutal-card p-0 overflow-hidden group" :data-delay="String(i*80)">
          <div class="aspect-[4/3] border-b-[3px] border-black overflow-hidden bg-zinc-200">
            <img :src="p.image" :alt="p.label" class="w-full h-full object-cover" loading="lazy" decoding="async" />
          </div>
          <div class="p-4 flex items-end justify-between gap-3">
            <div>
              <p class="font-mono text-[11px] font-bold tracking-widest uppercase">00{{ i+1 }} — {{ p.tag }}</p>
              <h3 class="text-sm font-black uppercase leading-tight">{{ p.label }}</h3>
            </div>
            <span class="h-8 w-8 border-[3px] border-black bg-[#1D4ED8] text-white flex items-center justify-center shrink-0">→</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const programs = [
  { label: 'English for Young Learner', tag: 'Kids', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80' },
  { label: 'English for Young Adults', tag: 'Teens & Students', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80' },
  { label: 'English for Professional', tag: 'Professionals', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80' }
]
</script>
