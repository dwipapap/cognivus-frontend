<template>
  <section class="bg-white py-16 md:py-24">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="reveal max-w-2xl mb-14">
        <p class="text-sm font-medium tracking-wide text-coral-red uppercase mb-3">Apa Tujuanmu?</p>
        <h2 class="text-3xl md:text-4xl font-bold text-default leading-tight">
          Tentukan Tujuan Belajar Bahasa Inggris
        </h2>
        <p class="mt-4 text-lg text-muted">
          Pilih jalur yang sesuai dengan tujuanmu, lalu mulai perjalanan belajar bersama ITTR.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10" data-reveal-stagger="0.08" data-reveal="fade-left">
        <div
          v-for="(goal, i) in goals"
          :key="i"
          class="reveal"
          :class="{ 'sm:pt-12': i >= 2 }"
        >
          <div class="flex gap-4">
            <span
              class="flex-shrink-0 text-5xl font-bold text-muted/25 leading-none select-none"
            >
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            <div class="min-w-0 pt-1.5">
              <div class="flex items-center gap-2.5 mb-2">
                <div
                  class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  :class="goal.iconBg"
                >
                  <UIcon :name="goal.icon" class="w-3.5 h-3.5" :class="goal.iconColor" />
                </div>
                <h3 class="text-base font-bold text-default leading-tight">{{ goal.heading }}</h3>
              </div>
              <p class="text-sm text-muted leading-relaxed">{{ goal.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const goals = [
  {
    heading: 'Persiapan Test',
    description: 'Siapkan dirimu dengan kursus bersama simulasi tes kami untuk meraih skor TOEFL, IELTS dan soal ujian dengan nilai terbaik.',
    icon: 'i-lucide-graduation-cap',
    iconBg: 'bg-pastel-mint',
    iconColor: 'text-swatch-green'
  },
  {
    heading: 'Kelas Umum',
    description: 'Dapatkan Layanan Les, Bimbel & Kursus Bahasa Inggris Reguler dengan kurikulum terpercaya yang dirancang oleh kurikulum ITTR.',
    icon: 'i-lucide-crown',
    iconBg: 'bg-pastel-peach',
    iconColor: 'text-coral-red'
  },
  {
    heading: 'Kesuksesan Karir',
    description: 'Sukses di pekerjaan atau tingkatkan jangkauan bisnismu dengan pembelajaran kami yang didesain khusus untuk kelas profesional.',
    icon: 'i-lucide-handshake',
    iconBg: 'bg-pastel-lavender',
    iconColor: 'text-swatch-magenta'
  },
  {
    heading: 'Upgrade Kemampuan',
    description: 'Perluas pengetahuanmu dengan belajar keterampilan berbahasa Inggris dengan belajar bersama ahlinya yang akan membantumu mengatasi kesulitan.',
    icon: 'i-lucide-star',
    iconBg: 'bg-pastel-sky',
    iconColor: 'text-swatch-blue'
  }
]
</script>
