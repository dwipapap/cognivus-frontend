<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'

const props = defineProps<{
  pdfDoc: PDFDocumentProxy | null
  pageNum: number
  isActive: boolean
}>()

const emit = defineEmits<{ (e: 'click'): void }>()

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isLoaded = ref(false)
const isLoading = ref(false)

let observer: IntersectionObserver | null = null
let renderTask: RenderTask | null = null

async function renderThumbnail() {
  if (isLoaded.value || isLoading.value || !props.pdfDoc || !canvasRef.value) return
  isLoading.value = true
  
  try {
    const page = await props.pdfDoc.getPage(props.pageNum)
    
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const targetWidth = 160
    const outputScale = targetWidth / viewport.width
    const scaledViewport = page.getViewport({ scale: outputScale })
    
    const pixelRatio = window.devicePixelRatio || 1
    canvas.width = Math.floor(scaledViewport.width * pixelRatio)
    canvas.height = Math.floor(scaledViewport.height * pixelRatio)
    canvas.style.width = Math.floor(scaledViewport.width) + 'px'
    canvas.style.height = Math.floor(scaledViewport.height) + 'px'
    
    const transform = pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : undefined

    renderTask = page.render({
      canvasContext: ctx,
      viewport: scaledViewport,
      transform: transform as any
    })
    
    await renderTask.promise
    isLoaded.value = true
  } catch (err: any) {
    if (err.name !== 'RenderingCancelledException') {
      console.error(`Error rendering thumbnail for page ${props.pageNum}:`, err)
    }
  } finally {
    isLoading.value = false
    renderTask = null
  }
}

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      renderThumbnail()
      if (observer && containerRef.value) {
        observer.unobserve(containerRef.value)
      }
    }
  }, { rootMargin: '200px' })
  
  if (containerRef.value) {
    observer.observe(containerRef.value)
  }
})

watch(() => props.pdfDoc, () => {
  isLoaded.value = false
  if (containerRef.value && observer) {
    observer.unobserve(containerRef.value)
    observer.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  if (renderTask) {
    renderTask.cancel()
  }
})
</script>

<template>
  <button
    type="button"
    ref="containerRef"
    class="flex flex-col items-center gap-1 cursor-pointer p-2 rounded-token-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    :class="[isActive ? 'bg-primary/10' : 'hover:bg-surface-hover']"
    :aria-label="`Go to page ${pageNum}`"
    :aria-current="isActive ? 'page' : undefined"
    @click="emit('click')"
  >
    <div 
      class="w-[160px] min-h-[200px] bg-surface flex items-center justify-center rounded overflow-hidden shadow-sm border"
      :class="[isActive ? 'border-primary shadow-md' : 'border-divider']"
    >
      <div v-if="!isLoaded" class="animate-pulse flex items-center justify-center w-full h-full bg-surface-subtle">
        <svg class="w-8 h-8 text-ink-muted/30" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <canvas ref="canvasRef" class="block bg-white" :class="{'opacity-0': !isLoaded, 'opacity-100 transition-opacity duration-300': isLoaded}" />
    </div>
    <span class="text-xs font-medium" :class="[isActive ? 'text-primary' : 'text-ink-muted']">
      {{ pageNum }}
    </span>
  </button>
</template>
