<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'

interface PageWatermarkOptions {
  columns: number
  rows: number
  rotation: number
  fontSize: number
  color: string
}

const props = defineProps<{
  pdfDoc: PDFDocumentProxy | null
  pageNum: number
  scale: number
  rotation: number
  fitWidth: boolean
  containerWidth: number
  watermarkText: string
  watermarkOptions: PageWatermarkOptions
}>()

const emit = defineEmits<{
  (e: 'visible', pageNum: number): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isLoaded = ref(false)
const isLoading = ref(false)
const isVisible = ref(false)

let observer: IntersectionObserver | null = null
let renderTask: RenderTask | null = null

async function renderPage() {
  if (!props.pdfDoc || !canvasRef.value) return
  isLoading.value = true
  
  try {
    const page = await props.pdfDoc.getPage(props.pageNum)
    
    let currentScale = props.scale
    if (props.fitWidth && props.containerWidth > 0) {
      const unscaledViewport = page.getViewport({ scale: 1, rotation: props.rotation })
      currentScale = Math.max(0.1, (props.containerWidth - 32) / unscaledViewport.width)
    }
    
    const viewport = page.getViewport({ scale: currentScale, rotation: props.rotation })
    
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const outputScale = window.devicePixelRatio || 1
    
    canvas.width = Math.floor(viewport.width * outputScale)
    canvas.height = Math.floor(viewport.height * outputScale)
    canvas.style.width = Math.floor(viewport.width) + 'px'
    canvas.style.height = Math.floor(viewport.height) + 'px'
    
    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined

    if (renderTask) {
      await renderTask.cancel()
    }

    renderTask = page.render({
      canvasContext: ctx,
      viewport,
      transform: transform as any
    })
    
    await renderTask.promise
    renderTask = null
    
    applyWatermark(canvas, ctx, viewport.width, viewport.height)
    isLoaded.value = true
  } catch (err: any) {
    if (err.name !== 'RenderingCancelledException') {
      console.error(`Error rendering page ${props.pageNum}:`, err)
    }
  } finally {
    isLoading.value = false
  }
}

function applyWatermark(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save()
  const outputScale = window.devicePixelRatio || 1
  ctx.scale(outputScale, outputScale)
  
  ctx.font = `${props.watermarkOptions.fontSize}px Arial`
  ctx.fillStyle = props.watermarkOptions.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  const cols = props.watermarkOptions.columns
  const rows = props.watermarkOptions.rows
  
  for (let i = 0; i <= cols; i++) {
    for (let j = 0; j <= rows; j++) {
      ctx.save()
      const x = (width / cols) * i
      const y = (height / rows) * j
      ctx.translate(x, y)
      ctx.rotate((props.watermarkOptions.rotation * Math.PI) / 180)
      ctx.fillText(props.watermarkText, 0, 0)
      ctx.restore()
    }
  }
  ctx.restore()
}

watch([() => props.pdfDoc, () => props.scale, () => props.rotation, () => props.fitWidth, () => props.containerWidth], () => {
  if (isVisible.value) {
    renderPage()
  } else {
    isLoaded.value = false
  }
})

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible.value = entry.isIntersecting
      if (entry.isIntersecting) {
        emit('visible', props.pageNum)
        if (!isLoaded.value && !isLoading.value) {
          renderPage()
        }
      }
    })
  }, { rootMargin: '50% 0px 50% 0px', threshold: 0.1 }) // Load well before it comes into view
  
  if (containerRef.value) {
    observer.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  if (renderTask) renderTask.cancel()
})
</script>

<template>
  <div 
    ref="containerRef"
    class="relative flex flex-col items-center w-full min-h-[500px] mb-4 last:mb-0"
    :id="`pdf-page-${pageNum}`"
  >
    <div :class="['bg-surface shadow-card-hover rounded-token-lg overflow-hidden transition-all', fitWidth ? 'w-full' : 'max-w-full']">
      <div v-if="!isLoaded" class="animate-pulse flex items-center justify-center w-full min-h-[800px] bg-surface-subtle">
        <svg class="w-12 h-12 text-ink-muted/30" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <canvas ref="canvasRef" class="mx-auto block" :class="{'hidden': !isLoaded}" />
    </div>
  </div>
</template>
