<template>
  <section id="lms-features" class="bg-white border-y-[3px] border-black">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      <div class="reveal flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-[3px] border-black pb-6">
        <div>
          <div class="brutal-label">ITTR LMS FEATURES</div>
          <h2 class="mt-3 text-[28px] md:text-[36px] font-black uppercase tracking-[-0.02em] leading-none">Learn <span class="bg-[#1D4ED8] text-white px-1 border-[3px] border-black">Without Hassle</span></h2>
          <p class="mt-2 font-mono text-xs font-bold tracking-widest uppercase text-zinc-600">ITTR × LMS — FROM ENROLLMENT TO GRADUATION</p>
        </div>
        <p class="max-w-md text-sm font-medium leading-relaxed border-[3px] border-black bg-[#EFF4FF] p-3">Every step of your course lives in the LMS: choose your goal, join a class, submit tasks, track grades.</p>
      </div>

      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <article v-for="(f,i) in features" :key="i" class="reveal brutal-card p-0 flex overflow-hidden min-h-[150px]" :class="i%2===1 ? 'bg-[#DBEAFE]' : 'bg-white'" :data-delay="String(i*70)">
          <div class="w-[76px] shrink-0 flex flex-col items-center justify-center border-r-[3px] border-black" :class="i%2===1 ? 'bg-[#1D4ED8] text-white' : 'bg-black text-white'">
            <span class="text-2xl font-black">{{ String(i+1).padStart(2,'0') }}</span>
            <UIcon :name="f.icon" class="h-5 w-5 mt-1" />
          </div>
          <div class="p-4 flex-1 flex flex-col">
            <h3 class="text-sm font-black uppercase tracking-wide">{{ f.title }}</h3>
            <p class="mt-1 text-[13px] leading-relaxed font-medium text-zinc-700">{{ f.desc }}</p>
            <div class="mt-auto pt-3 flex items-center gap-2">
              <span class="inline-flex border-[2px] border-black px-2 py-0.5 text-[11px] font-black uppercase" :class="i%2===1 ? 'bg-black text-white' : 'bg-[#1D4ED8] text-white'">{{ f.cta }}</span>
              <span class="h-[3px] flex-1 bg-black"></span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
const features = [
  { title: 'Small, Focused Classes', desc: 'Max 10 students per class. Schedule & attendance live in the LMS.', icon: 'i-lucide-users', cta: 'ENTER CLASS →' },
  { title: 'Centralized Materials & Tasks', desc: 'Modules, videos, assignments & deadlines — auto notifications.', icon: 'i-lucide-book-open', cta: 'OPEN MATERIALS →' },
  { title: 'Transparent Grades', desc: 'Assignment & exam scores in real time. Download report cards in LMS.', icon: 'i-lucide-bar-chart-3', cta: 'CHECK GRADES →' },
  { title: 'Secure Payments', desc: 'Invoices, installments & receipts recorded. No hidden fees.', icon: 'i-lucide-credit-card', cta: 'PAY NOW →' }
]
</script>
