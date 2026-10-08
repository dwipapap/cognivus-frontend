<script setup>
import { useScrollReveal } from '../composables/useScrollReveal.js'
import Navbar from '../components/Navbar.vue'
import HomeHero from '../components/home/HomeHero.vue'
import HomeTrustedBy from '../components/home/HomeTrustedBy.vue'
import HomeWhyITTR from '../components/home/HomeWhyITTR.vue'
import HomeLearningGoals from '../components/home/HomeLearningGoals.vue'
import HomeMethods from '../components/home/HomeMethods.vue'
import HomeByLevel from '../components/home/HomeByLevel.vue'
import HomeInstructors from '../components/home/HomeInstructors.vue'
import HomeFooter from '../components/home/HomeFooter.vue'
import '@/assets/home-brutal.css'

useScrollReveal()
</script>

<template>
  <div class="homepage--brutal">
    <Navbar />
    <main>
      <HomeHero />
      <HomeTrustedBy />
      <HomeWhyITTR />
      <HomeLearningGoals />
      <HomeMethods />
      <HomeByLevel />
      <HomeInstructors />
      <HomeFooter />
    </main>
  </div>
</template>
