<template>
  <section class="bg-white">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-4 flex flex-col justify-center">
          <h2 class="text-4xl md:text-5xl font-black leading-tight text-gray-900">
            <span class="text-[#0094ce]">Mengapa</span>
            <br />
            <span>memilih kursus ini?</span>
          </h2>
          <p class="mt-6 text-gray-600 text-lg leading-relaxed">
            {{ description }}
          </p>
          <div class="mt-8">
            <a
              href="#"
              class="inline-flex items-center justify-center gap-2 bg-[#0094ce] text-white font-semibold px-8 py-4 sm:py-3.5 rounded-full transition-all duration-200 hover:bg-[#239a8b] hover:-translate-y-0.5 hover:shadow-lg w-full sm:w-auto"
            >
              Daftar Sekarang
            </a>
          </div>
        </div>

        <div class="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div
            v-for="(item, i) in topCards"
            :key="i"
            class="relative rounded-3xl overflow-hidden min-h-[180px] sm:min-h-[240px] group"
          >
            <img
              :src="item.image"
              :alt="item.title"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div class="relative z-10 h-full flex flex-col justify-end p-8">
              <h3 class="text-xl font-bold text-white">
                {{ item.title }}
              </h3>
              <p class="text-white/80 text-sm leading-relaxed mt-2">
                {{ item.desc }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div
          v-for="(item, i) in bottomCards"
          :key="i"
          class="relative rounded-3xl overflow-hidden min-h-[200px] sm:min-h-[280px] group"
        >
          <img
            :src="item.image"
            :alt="item.title"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div class="relative z-10 h-full flex flex-col justify-end p-6">
            <h3 class="text-lg font-bold text-white mb-1">
              {{ item.title }}
            </h3>
            <p class="text-white/70 text-sm leading-relaxed line-clamp-3">
              {{ item.desc }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const description =
  "60+ tahun pengalaman, ribuan alumni, dan metode belajar terbukti dalam satu tempat."

const topCards = [
  {
    title: 'Pelopor Kursus Bahasa Inggris',
    desc: 'Kami adalah lembaga kursus bahasa Inggris yang pertama hadir di Pekanbaru dan mungkin di Provinsi Riau.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80'
  },
  {
    title: '60+ Tahun Pengalaman',
    desc: 'ITTR English Course sudah berpengalaman lebih dari 60 tahun untuk kursus bahasa Inggris di Pekanbaru.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80'
  }
]

const bottomCards = [
  {
    title: 'Banyak Metode Belajar',
    desc: 'Sebagai lembaga kursus yang berpengalaman tentunya kami memiliki banyak metode yang cocok diterapkan agar siswa kami tidak jenuh dengan materi belajar.',
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&q=80'
  },
  {
    title: 'Banyak Pilihan Program',
    desc: 'Sebagai lembaga kursus terkemuka di Pekanbaru kami menawarkan banyak pilihan kursus yang bisa disesuaikan dengan kebutuhan peserta belajar.',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80'
  },
  {
    title: 'Lokasi Strategis di Pusat Kota',
    desc: 'Tentunya sebagai lembaga kursus yang terkemuka kami berada di tengah kota yang memudahkan siswa untuk menjangkau lokasi kami.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80'
  },
  {
    title: 'Biaya Lebih Terjangkau',
    desc: 'Kami menawarkan biaya yang lebih terjangkau dibandingkan dengan lembaga kursus lainnya di Pekanbaru.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80'
  }
]
</script>
