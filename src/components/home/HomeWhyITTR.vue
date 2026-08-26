<template>
  <section class="bg-[#EFF4FF] border-y-[3px] border-black">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div class="brutal-label">WHY ITTR × LMS</div>
          <h2 class="reveal mt-3 text-[28px] md:text-[40px] font-black leading-[0.9] tracking-[-0.02em] uppercase" data-delay="30">
            60 YRS <span class="bg-black text-white px-1">Heritage</span><br /> + Modern LMS
          </h2>
        </div>
        <div class="max-w-xl">
          <p class="reveal text-sm md:text-[15px] leading-relaxed font-medium border-[3px] border-black bg-white p-3 shadow-[4px_4px_0_#000]" data-delay="60">
            {{ description }}
          </p>
          <a href="#lms-features" class="reveal mt-4 inline-flex brutal-btn brutal-btn--primary px-5 py-2.5 text-sm" data-delay="80">
            Why LMS ITTR is different <UIcon name="i-lucide-arrow-right" class="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <article
          v-for="(item, i) in cards"
          :key="item.title"
          class="reveal brutal-card p-4 flex flex-col min-h-[170px]"
          :class="item.variant"
          :data-delay="String(i * 70)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="icon-box h-9 w-9 border-[3px] flex items-center justify-center shrink-0" :class="item.iconBox">
              <UIcon :name="item.icon" class="h-4 w-4" />
            </div>
            <span class="font-mono text-[11px] font-bold tracking-widest border-[2px] border-black px-1.5 py-0.5" :class="item.numClass">0{{ i+1 }}</span>
          </div>
          <h3 class="mt-4 text-[15px] font-black leading-tight uppercase tracking-tight">{{ item.title }}</h3>
          <p class="mt-1.5 text-[13.5px] leading-relaxed font-medium line-clamp-3" :class="item.textMuted ? 'text-white/90' : 'text-zinc-700'">{{ item.desc }}</p>
          <div class="mt-auto pt-3 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide">
            <span class="h-[3px] flex-1" :class="item.line"></span> {{ item.tag }}
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
const description =
  "Pioneering since 1960. Our LMS makes every step one-stop — from enrollment to grades — hassle-free."

const cards = [
  { title: 'Pioneer in Pekanbaru', desc: 'The first English course in Pekanbaru — perhaps in Riau.', icon: 'i-lucide-flag', variant: 'bg-white', iconBox: 'bg-[#DBEAFE] border-black text-[#1E3A8A]', numClass: 'bg-white text-black', line: 'bg-black', tag: 'SINCE 1960' },
  { title: 'Trusted for 60+ Years', desc: 'Proven curriculum across generations, updated via LMS.', icon: 'i-lucide-history', variant: 'brutal-card--light', iconBox: 'bg-white border-black text-black', numClass: 'bg-black text-white', line: 'bg-black', tag: 'TRUSTED' },
  { title: 'One-Stop LMS', desc: 'Classes, materials, assignments, grades, payments — one dashboard.', icon: 'i-lucide-layout-dashboard', variant: 'brutal-card--blue', iconBox: 'bg-white border-black text-[#1D4ED8]', numClass: 'bg-white text-black', line: 'bg-white', textMuted: true, tag: 'LMS' },
  { title: 'Transparent Pricing', desc: 'Affordable, no hidden fees. Check real-time in the LMS.', icon: 'i-lucide-badge-percent', variant: 'brutal-card--navy', iconBox: 'bg-white border-black text-black', numClass: 'bg-white text-black', line: 'bg-white', textMuted: true, tag: 'AFFORDABLE' }
]
</script>
