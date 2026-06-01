<template>
  <footer>
    <div class="bg-sun-yellow py-10 md:py-14">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 class="text-2xl font-bold text-ink-warm">Dapatkan Informasi Terbaru</h3>
            <p class="text-ink-warm/70 mt-1">Berlangganan newsletter kami untuk info kursus terbaru.</p>
          </div>
          <div class="flex w-full max-w-md gap-3">
            <UInput
              type="email"
              placeholder="Masukkan email Anda"
              class="flex-1"
              size="lg"
              color="neutral"
            />
            <button
              type="button"
              class="bg-ink-warm text-white hover:bg-ink-warm/90 font-semibold rounded-full px-6 py-2.5 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink-warm/40"
            >
              Langganan
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-hero-sky py-12 md:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h4 class="font-bold text-white text-lg mb-4">ITTR English Course</h4>
            <p class="text-sm text-white/70 leading-relaxed">
              Lembaga kursus bahasa Inggris terpercaya di Pekanbaru dengan pengalaman lebih dari 60 tahun.
            </p>
          </div>

          <div>
            <h4 class="font-bold text-white text-lg mb-4">Kontak</h4>
            <ul class="space-y-2 text-sm text-white/70">
              <li>Pekanbaru, Riau</li>
              <li>Telp: (0761) xxxxx</li>
              <li>Email: info@ittr-english.com</li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-white text-lg mb-4">Program</h4>
            <ul class="space-y-2 text-sm text-white/70">
              <li>Pre Elementary</li>
              <li>Elementary</li>
              <li>Intermediate</li>
              <li>Advanced</li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-white text-lg mb-4">Ikuti Kami</h4>
            <div class="flex gap-3">
              <a href="#" class="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors" aria-label="Instagram">
                <UIcon name="i-lucide-instagram" class="w-5 h-5" />
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors" aria-label="WhatsApp">
                <UIcon name="i-lucide-message-circle" class="w-5 h-5" />
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors" aria-label="YouTube">
                <UIcon name="i-lucide-youtube" class="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-white/15 text-center text-sm text-white/50">
          &copy; {{ new Date().getFullYear() }} ITTR English Course Pekanbaru. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>
