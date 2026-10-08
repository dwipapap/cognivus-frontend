<template>
  <section class="relative bg-[#EFF4FF] border-b-[3px] border-black overflow-hidden">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 opacity-[0.05]" style="background-image: linear-gradient(to right,#1E3A8A 1px,transparent 1px),linear-gradient(to bottom,#1E3A8A 1px,transparent 1px); background-size: 32px 32px;" />
    <div aria-hidden="true" class="pointer-events-none absolute -right-6 top-8 hidden lg:block w-[40%] h-[74%] bg-[#DBEAFE] border-[3px] border-black shadow-[8px_8px_0_#000]" />
    <div aria-hidden="true" class="pointer-events-none absolute -right-2 top-14 hidden lg:block w-[40%] h-[74%] bg-[#1D4ED8] border-[3px] border-black" style="transform: rotate(1deg);" />

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-10 md:pb-12">
      <div class="grid lg:grid-cols-12 gap-8 items-start">
        <div class="lg:col-span-7">
          <div class="reveal brutal-label" data-delay="0">
            <span class="h-2 w-2 bg-[#1D4ED8]"></span> LMS ITTR — PEKANBARU SINCE 1960
            <span class="ml-2 bg-black text-white px-1.5 py-0.5 text-[10px]">60+ YRS</span>
          </div>

          <h1 class="reveal mt-4 text-[38px] sm:text-[52px] lg:text-[64px] font-black leading-[0.85] tracking-[-0.04em] uppercase text-black" data-delay="50">
            LMS<br />
            <span class="inline-block bg-black text-white px-2 -rotate-[0.5deg]">ITTR</span>
            <span class="inline-block bg-[#1D4ED8] text-white px-2 rotate-[0.6deg] ml-1">English Course</span>
          </h1>
          <p class="reveal mt-2 font-mono text-xs font-bold tracking-widest uppercase text-[#1E3A8A]" data-delay="70">English Course + Learning Management System</p>

          <p class="reveal mt-4 max-w-[52ch] text-[15px] leading-relaxed font-medium text-black border-[3px] border-black bg-white p-3 shadow-[4px_4px_0_#000]" data-delay="90">
            <span class="font-black">ITTR English Course</span> is Riau's pioneering English course. Our <span class="font-black">LMS</span> brings everything together: online enrollment, materials & assignments, transparent grades, and payments in one dashboard.
          </p>

          <div class="reveal mt-5 flex flex-wrap gap-2" data-delay="110">
            <span class="border-[2px] border-black bg-white px-2 py-1 text-xs font-black uppercase">Classes</span>
            <span class="border-[2px] border-black bg-[#DBEAFE] px-2 py-1 text-xs font-black uppercase">Materials</span>
            <span class="border-[2px] border-black bg-white px-2 py-1 text-xs font-black uppercase">Grades</span>
            <span class="border-[2px] border-black bg-[#1D4ED8] text-white px-2 py-1 text-xs font-black uppercase">Payments</span>
          </div>

          <div class="reveal mt-6 flex flex-col sm:flex-row gap-3" data-delay="130">
            <router-link to="/login" class="brutal-btn brutal-btn--primary px-7 py-3.5 text-sm inline-flex items-center justify-center gap-2">
              Enter LMS <UIcon name="i-lucide-log-in" class="h-4 w-4" />
            </router-link>
            <a href="#lms-features" class="brutal-btn brutal-btn--ghost px-7 py-3.5 text-sm inline-flex items-center justify-center gap-2">
              How It Works <UIcon name="i-lucide-arrow-down" class="h-4 w-4" />
            </a>
          </div>

          <div class="reveal mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-wide" data-delay="150">
            <span class="bg-black text-white px-2 py-1">Learn</span><span class="w-6 h-[3px] bg-black"></span><span>Create</span><span class="w-6 h-[3px] bg-black"></span><span>Achieve</span>
          </div>
        </div>

        <div class="lg:col-span-5 reveal" data-delay="100">
          <div class="relative brutal-card p-2 bg-white">
            <div class="border-[3px] border-black bg-[#0F172A] p-2">
              <div class="flex items-center gap-1.5 border-b border-white/15 pb-2 mb-2">
                <span class="h-2.5 w-2.5 bg-[#FF3B30] border border-black"></span><span class="h-2.5 w-2.5 bg-[#DBEAFE] border border-black"></span><span class="h-2.5 w-2.5 bg-[#1D4ED8] border border-black"></span>
                <span class="ml-2 font-mono text-[10px] font-bold tracking-widest text-white/70">LMS.ITTR.AC.ID — STUDENT DASHBOARD</span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div class="border-[2px] border-black bg-white p-2"><p class="font-mono text-[10px] font-bold">CLASS</p><p class="text-sm font-black">Intermediate</p><p class="text-xs font-medium">≤10 students</p></div>
                <div class="border-[2px] border-black bg-[#DBEAFE] p-2"><p class="font-mono text-[10px] font-bold">MATERIALS</p><p class="text-sm font-black">12 Modules</p><p class="text-xs font-medium">3 Assignments</p></div>
                <div class="border-[2px] border-black bg-[#1D4ED8] text-white p-2"><p class="font-mono text-[10px] font-bold">GRADES</p><p class="text-sm font-black">A- 88.5</p><p class="text-xs">Transparent</p></div>
              </div>
              <div class="mt-2 aspect-[16/9] border-[3px] border-black overflow-hidden bg-white">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1100&q=80" alt="ITTR LMS Dashboard" class="w-full h-full object-cover" loading="eager" decoding="async" />
              </div>
            </div>
            <div class="absolute -left-3 -bottom-3 bg-[#1E3A8A] text-white border-[3px] border-black px-3 py-2 font-black text-xs uppercase shadow-[4px_4px_0_#000] rotate-[-1deg]">LMS + 60 YRS ITTR</div>
            <div class="absolute -top-3 -right-3 bg-white text-black border-[3px] border-black px-2 py-1 font-mono text-[11px] font-bold tracking-widest shadow-[3px_3px_0_#000]">EST. 1960</div>
          </div>
          <p class="mt-4 text-center font-mono text-[11px] font-bold tracking-widest uppercase">BLUE-ONLY BRUTAL • 3PX BORDER • 0 RADIUS</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>
