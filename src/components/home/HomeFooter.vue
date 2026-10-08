<template>
  <footer>
    <div class="bg-[#DBEAFE] border-b-[3px] border-black py-8">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-black uppercase">Get the Latest Updates</h3>
          <p class="text-sm font-medium">Newsletter — latest course info, no spam.</p>
        </div>
        <div class="flex w-full max-w-md gap-2">
          <input type="email" placeholder="YOUR EMAIL" class="flex-1 border-[3px] border-black bg-white px-3 py-2.5 text-sm font-bold placeholder:text-zinc-500 focus:outline-none" />
          <button type="button" class="brutal-btn bg-black text-white px-6 py-2.5 text-sm font-black">SUBSCRIBE</button>
        </div>
      </div>
    </div>
    <div class="bg-black text-white py-10">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="border-[3px] border-white p-4">
            <h4 class="font-black uppercase">ITTR English Course</h4>
            <p class="mt-2 text-sm leading-relaxed text-white/80 font-medium">Trusted English course in Pekanbaru — 60+ years.</p>
          </div>
          <div>
            <h4 class="font-black uppercase text-[#DBEAFE]">Our Office</h4>
            <ul class="mt-3 space-y-3 text-sm font-medium text-white/85">
              <li class="flex gap-2.5 leading-relaxed">
                <UIcon name="i-lucide-building-2" class="h-4 w-4 mt-0.5 shrink-0 text-[#DBEAFE]" />
                <span>Jl. Teratai. 234 c Pulau Karam, Kec. Sukajadi, Kota Pekanbaru, Riau, Indonesia</span>
              </li>
              <li class="flex gap-2.5 leading-relaxed">
                <UIcon name="i-lucide-building-2" class="h-4 w-4 mt-0.5 shrink-0 text-[#DBEAFE]" />
                <span>Jl. Melati Indah, Delima, Binawidya Tampan, Kota Pekanbaru, Riau, Indonesia</span>
              </li>
              <li class="flex items-center gap-2.5">
                <UIcon name="i-lucide-message-circle" class="h-4 w-4 shrink-0 text-[#DBEAFE]" />
                <a href="https://wa.me/6285265828242" class="hover:text-white hover:underline underline-offset-2">+62 852 6582 8242</a>
              </li>
              <li class="flex items-center gap-2.5">
                <UIcon name="i-lucide-phone" class="h-4 w-4 shrink-0 text-[#DBEAFE]" />
                <a href="tel:+6285265828242" class="hover:text-white hover:underline underline-offset-2">+62 852 6582 8242</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-black uppercase text-[#DBEAFE]">Programs</h4>
            <ul class="mt-2 space-y-1 text-sm font-medium text-white/80"><li>Pre Elementary</li><li>Elementary</li><li>Intermediate</li><li>Advanced</li></ul>
          </div>
          <div>
            <h4 class="font-black uppercase text-[#DBEAFE]">Follow Us</h4>
            <div class="mt-3 flex gap-2">
              <a href="https://www.instagram.com/ittr_englishcourse" class="h-10 w-10 border-[3px] border-white bg-white text-black flex items-center justify-center hover:bg-[#1D4ED8] hover:text-white" aria-label="Instagram"><UIcon name="i-lucide-instagram" class="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div class="mt-8 border-t-[3px] border-white/20 pt-4 text-center font-mono text-xs font-bold tracking-widest">© {{ new Date().getFullYear() }} ITTR — PEKANBARU • BUILT BRUTAL</div>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>
