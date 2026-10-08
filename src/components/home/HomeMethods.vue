<template>
  <section class="bg-[#1D4ED8] border-y-[3px] border-black py-6">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="brutal-card bg-white p-4 md:p-6 flex flex-col md:flex-row gap-6">
        <div class="md:w-[280px] shrink-0 border-r-0 md:border-r-[3px] md:pr-6 border-black">
          <div class="bg-black text-white inline-flex px-2 py-1 text-xs font-black uppercase tracking-widest">LEVEL</div>
          <h2 class="mt-2 text-2xl md:text-3xl font-black uppercase leading-none">Learning<br/><span class="bg-[#DBEAFE] px-1 border-[3px] border-black">Method</span></h2>
          <p class="mt-3 text-sm font-medium leading-relaxed bg-[#EFF4FF] border-[3px] border-black p-2">Experienced instructors, ≤10 students per class. Never boring.</p>
        </div>
        <div class="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div v-for="(c,i) in cards" :key="i" class="reveal border-[3px] border-black bg-white p-3 text-center shadow-[4px_4px_0_#000]" :data-delay="String(i*60)">
            <div class="mx-auto h-10 w-10 border-[3px] border-black bg-[#DBEAFE] flex items-center justify-center">
              <UIcon :name="c.icon" class="h-5 w-5" />
            </div>
            <h3 class="mt-2 text-xs font-black uppercase leading-tight">{{ c.level }}</h3>
            <p class="mt-1 text-[12px] leading-snug font-medium text-zinc-700">{{ c.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const cards = [
  { level: 'Pre Elementary', icon: 'i-lucide-book-open', description: 'Young Learner. Max 10/class.' },
  { level: 'Elementary', icon: 'i-lucide-pencil', description: 'Beginner. Max 10/class.' },
  { level: 'Intermediate', icon: 'i-lucide-graduation-cap', description: 'Intermediate. Max 10/class.' },
  { level: 'Advanced', icon: 'i-lucide-award', description: 'Advanced. Max 10/class.' }
]
</script>
