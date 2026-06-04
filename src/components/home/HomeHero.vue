<template>
  <section class="relative min-h-[100dvh] flex items-end overflow-hidden">
    <div class="absolute inset-0">
      <img
        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80"
        alt="Siswa belajar bahasa Inggris bersama di kelas"
        class="w-full h-full object-cover"
      />
      <div
        class="absolute inset-0"
        style="background: linear-gradient(135deg, oklch(0.25 0.12 280 / 0.92) 0%, oklch(0.30 0.10 260 / 0.70) 50%, oklch(0.20 0.08 270 / 0.85) 100%)"
      />
    </div>

    <div class="relative z-10 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-24 pt-32 md:pt-40">
      <div class="max-w-2xl">
        <h1 class="reveal text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white">
          Kuasai Bahasa Inggris Bersama <span style="color: #0094ce">ITTR English Course</span>
        </h1>
        <p class="reveal mt-5 md:mt-6 text-base md:text-lg text-white/80 max-w-xl leading-relaxed" data-delay="80">
          Lembaga kursus bahasa Inggris terpercaya di Pekanbaru dengan pengalaman lebih dari 60 tahun. Bergabunglah dan raih tujuanmu.
        </p>
        <div class="reveal mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4" data-delay="160">
          <button
            type="button"
            class="w-full sm:w-auto bg-[#0094ce] hover:bg-[#007bb5] text-white font-semibold px-7 py-4 sm:py-3 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0094ce]/50 text-center"
          >
            Mulai Belajar
          </button>
          <button
            type="button"
            class="w-full sm:w-auto group border-2 border-white/50 text-white hover:bg-white/10 hover:border-white font-semibold px-7 py-4 sm:py-3 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 inline-flex items-center justify-center gap-2"
          >
            Lihat Program Kami
            <svg class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>

      <div class="reveal mt-12 md:mt-16 flex flex-wrap gap-x-6 gap-y-2 md:gap-10 text-white/60 text-sm font-medium tracking-wide" data-delay="240">
        <span class="text-white">Learn</span>
        <span>Create</span>
        <span>Achieve</span>
        <span>Get acquainted</span>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>
