<script setup>
import { useScrollReveal } from '../composables/useScrollReveal.js'
import Navbar from '../components/Navbar.vue'
import HomeHero from '../components/home/HomeHero.vue'
import HomeTrustedBy from '../components/home/HomeTrustedBy.vue'
import ScallopDivider from '../components/home/ScallopDivider.vue'
import HomeWhyITTR from '../components/home/HomeWhyITTR.vue'
import HomeLearningGoals from '../components/home/HomeLearningGoals.vue'
import HomeMethods from '../components/home/HomeMethods.vue'
import HomeByLevel from '../components/home/HomeByLevel.vue'
import HomeInstructors from '../components/home/HomeInstructors.vue'
import HomeTestimonials from '../components/home/HomeTestimonials.vue'
import HomeFooter from '../components/home/HomeFooter.vue'

useScrollReveal()
</script>

<template>
  <div>
    <Navbar />
    <main>
      <HomeHero />
      <ScallopDivider fill="white" />
      <HomeTrustedBy />
      <HomeWhyITTR />
      <HomeLearningGoals />
      <HomeMethods />
      <ScallopDivider fill="oklch(0.62 0.15 230)" />
      <HomeByLevel />
      <HomeInstructors />
      <HomeTestimonials />
      <HomeFooter />
    </main>
  </div>
</template>
