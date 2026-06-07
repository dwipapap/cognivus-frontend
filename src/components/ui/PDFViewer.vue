<script setup lang="ts">
import { ref, shallowRef, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFDocumentLoadingTask, RenderTask } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import PDFThumbnail from './PDFThumbnail.vue'
import PDFPage from './PDFPage.vue'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl + '?v=2'

interface OutlineNode {
  title: string
  bold: boolean
  italic: boolean
  color: Uint8ClampedArray
  dest: string | any[] | null
  url: string | null
  unsafeUrl: string | undefined
  newWindow: boolean | undefined
  count: number | undefined
  items: OutlineNode[]
}

interface FlatOutlineItem {
  title: string
  depth: number
  original: OutlineNode
}

interface WatermarkOptions {
  columns: number
  rows: number
  rotation: number
  fontSize: number
  color: string
}

const props = defineProps<{ src: string }>()

const isLoading = ref(true)
const error = ref<string | null>(null)

const pdfDoc = shallowRef<PDFDocumentProxy | null>(null)
let currentLoadingTask: PDFDocumentLoadingTask<PDFDocumentProxy> | null = null
let renderTask: RenderTask | null = null
const totalPages = ref(0)
const outlineItems = ref<OutlineNode[]>([])

async function loadPDF() {
  isLoading.value = true
  error.value = null
  if (currentLoadingTask) {
    currentLoadingTask.destroy()
    currentLoadingTask = null
    pdfDoc = null
  }
  
  try {
    currentLoadingTask = pdfjsLib.getDocument({ url: props.src })
    pdfDoc.value = await currentLoadingTask.promise
    totalPages.value = pdfDoc.value.numPages
    
    const outline = await pdfDoc.value.getOutline()
    outlineItems.value = (outline as OutlineNode[]) || []
    
    isLoading.value = false
    
    await nextTick()
    renderPage(currentPage.value)
  } catch (err: any) {
    error.value = `Failed to load PDF: ${err.message}`
    isLoading.value = false
  }
}

async function renderPage(pageNum: number) {
  if (!pdfDoc.value || !pdfCanvasRef.value) return
  
  try {
    const page = await pdfDoc.value.getPage(pageNum)
    
    let currentScale = scale.value
    if (fitWidth.value && containerRef.value) {
      const containerWidth = containerRef.value.clientWidth
      const unscaledViewport = page.getViewport({ scale: 1, rotation: rotation.value })
      currentScale = Math.max(0.1, (containerWidth - 32) / unscaledViewport.width)
    }
    
    const viewport = page.getViewport({ scale: currentScale, rotation: rotation.value })
    
    const canvas = pdfCanvasRef.value
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
  } catch (err: any) {
    if (err.name !== 'RenderingCancelledException') {
      console.error('Error rendering page:', err)
    }
  }
}

function applyWatermark(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save()
  const outputScale = window.devicePixelRatio || 1
  ctx.scale(outputScale, outputScale)
  
  ctx.font = `${watermarkOptions.fontSize}px Arial`
  ctx.fillStyle = watermarkOptions.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  const cols = watermarkOptions.columns
  const rows = watermarkOptions.rows
  
  for (let i = 0; i <= cols; i++) {
    for (let j = 0; j <= rows; j++) {
      ctx.save()
      const x = (width / cols) * i
      const y = (height / rows) * j
      ctx.translate(x, y)
      ctx.rotate((watermarkOptions.rotation * Math.PI) / 180)
      ctx.fillText(watermarkText, 0, 0)
      ctx.restore()
    }
  }
  ctx.restore()
}

async function getPDFDestination(dest: any) {
  if (!pdfDoc.value) return null
  try {
    const destination = typeof dest === 'string' ? await pdfDoc.value.getDestination(dest) : dest
    if (destination) {
      const pageIndex = await pdfDoc.value.getPageIndex(destination[0])
      return pageIndex + 1
    }
  } catch (err) {
    console.error('Error getting destination:', err)
  }
  return null
}

const watermarkText = 'Property of ITTREnglish Course'
const watermarkOptions: WatermarkOptions = { columns: 3, rows: 4, rotation: 45, fontSize: 15, color: 'rgba(100, 100, 100, 0.15)' }

const scale = ref(1)
const fitWidth = ref(false)
const rotation = ref(0)
const currentPage = ref(1)
const pageInput = ref('1')
const activeSidebar = ref<'none' | 'toc' | 'thumbnails'>('none')
const viewMode = ref<'single' | 'continuous'>('single')
const isMobile = ref(false)

const containerRef = ref<HTMLElement | null>(null)
const pdfCanvasRef = ref<HTMLCanvasElement | null>(null)
const isFullscreen = ref(false)
const containerWidth = ref(0)

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    containerRef.value?.requestFullscreen().catch(err => {
      console.warn('Error attempting to enable fullscreen:', err.message)
    })
  } else {
    document.exitFullscreen()
  }
}

function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
  if (viewMode.value === 'single') {
    setTimeout(() => renderPage(currentPage.value), 150)
  }
}

function handleResize() {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth
  }
  if (fitWidth.value && viewMode.value === 'single') {
    renderPage(currentPage.value)
  }
}

const zoomPct = computed(() => Math.round(scale.value * 100))
const canZoomIn = computed(() => scale.value < 2)
const canZoomOut = computed(() => scale.value > 0.5)
const canPrev = computed(() => currentPage.value > 1)
const canNext = computed(() => currentPage.value < totalPages.value)

const tocItems = computed(() => {
  if (!outlineItems.value) return []
  const flat: FlatOutlineItem[] = []
  function walk(items: OutlineNode[], depth: number) {
    for (const item of items) {
      flat.push({ title: item.title, depth, original: item })
      if (item.items?.length) walk(item.items, depth + 1)
    }
  }
  walk(outlineItems.value, 0)
  return flat
})

function zoomIn() {
  if (canZoomIn.value) { scale.value = Math.min(scale.value + 0.25, 2); fitWidth.value = false }
}
function zoomOut() {
  if (canZoomOut.value) { scale.value = Math.max(scale.value - 0.25, 0.5); fitWidth.value = false }
}
function resetZoom() { scale.value = 1; fitWidth.value = false; setTimeout(() => renderPage(currentPage.value), 50) }
function toggleFitWidth() { 
  fitWidth.value = !fitWidth.value
  if (fitWidth.value) scale.value = 1 
  setTimeout(() => renderPage(currentPage.value), 50)
}
function rotateCW() { rotation.value = (rotation.value + 90) % 360 }

function goToPage(n: number) {
  const p = Math.max(1, Math.min(n, totalPages.value))
  
  if (viewMode.value === 'continuous') {
    const el = document.getElementById(`pdf-page-${p}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  } else {
    currentPage.value = p
    pageInput.value = String(p)
  }
}
function prevPage() { if (canPrev.value) goToPage(currentPage.value - 1) }
function nextPage() { if (canNext.value) goToPage(currentPage.value + 1) }
function firstPage() { goToPage(1) }
function lastPage() { goToPage(totalPages.value) }
function jumpToPage() {
  const n = parseInt(pageInput.value)
  if (!isNaN(n)) goToPage(n)
}

function handlePageVisible(pageNum: number) {
  if (viewMode.value === 'continuous') {
    currentPage.value = pageNum
    pageInput.value = String(pageNum)
  }
}

async function navigateToOutlineItem(item: OutlineNode) {
  if (item.dest) {
    const pageNum = await getPDFDestination(item.dest)
    if (pageNum) goToPage(pageNum)
  }
  if (isMobile.value) activeSidebar.value = 'none'
}

function onMqlChange(e: MediaQueryListEvent) {
  isMobile.value = e.matches
}

function handleKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prevPage() }
  else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); nextPage() }
  else if (e.key === 'Home') { e.preventDefault(); firstPage() }
  else if (e.key === 'End') { e.preventDefault(); lastPage() }
}

let mql: MediaQueryList | null = null
onMounted(() => {
  mql = window.matchMedia('(max-width: 767px)')
  isMobile.value = mql.matches
  mql.addEventListener('change', onMqlChange)
  if (isMobile.value) fitWidth.value = true
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
  
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth
  }
  
  loadPDF()
})
onUnmounted(() => { 
  if (mql) mql.removeEventListener('change', onMqlChange)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
  if (currentLoadingTask) currentLoadingTask.destroy()
})

let touchStartX = 0
let touchStartY = 0
function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
    if (dx < 0) nextPage()
    else prevPage()
  }
}

watch(() => props.src, () => {
  scale.value = 1
  rotation.value = 0
  currentPage.value = 1
  pageInput.value = '1'
  fitWidth.value = isMobile.value
  loadPDF()
})

watch([currentPage, scale, rotation], () => {
  if (!isLoading.value && viewMode.value === 'single') {
    renderPage(currentPage.value)
  }
})

watch(viewMode, (newMode) => {
  if (newMode === 'single' && !isLoading.value) {
    setTimeout(() => renderPage(currentPage.value), 50)
  }
})
</script>

<template>
  <div ref="containerRef" class="pdf-viewer-container flex flex-col h-full bg-surface">
    <div class="sticky top-0 z-20 bg-surface border-b border-divider px-2 sm:px-3 py-1.5 sm:py-2 shadow-card-rest">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
        
        <!-- Top/Left Controls: Sidebar, Zoom, View Options -->
        <div class="flex items-center gap-1 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 hide-scrollbars">
          <UButton
            v-if="tocItems.length"
            :icon="activeSidebar === 'toc' ? 'i-lucide-list-x' : 'i-lucide-list'"
            size="sm"
            :color="activeSidebar === 'toc' ? 'primary' : 'neutral'"
            variant="ghost"
            class="shrink-0"
            aria-label="Table of contents"
            @click="activeSidebar = activeSidebar === 'toc' ? 'none' : 'toc'"
          />

          <UButton
            :icon="activeSidebar === 'thumbnails' ? 'i-lucide-layout-grid' : 'i-lucide-layout-grid'"
            size="sm"
            :color="activeSidebar === 'thumbnails' ? 'primary' : 'neutral'"
            variant="ghost"
            class="shrink-0"
            aria-label="Thumbnails"
            @click="activeSidebar = activeSidebar === 'thumbnails' ? 'none' : 'thumbnails'"
          />

          <USeparator orientation="vertical" class="h-5 sm:h-6 shrink-0" />

          <UButton
            icon="i-lucide-zoom-out"
            size="sm"
            color="neutral"
            variant="ghost"
            class="shrink-0"
            aria-label="Zoom out"
            :disabled="!canZoomOut"
            @click="zoomOut"
          />
          <UButton
            size="sm"
            color="neutral"
            variant="ghost"
            :label="`${zoomPct}%`"
            aria-label="Reset zoom"
            class="min-w-[52px] sm:min-w-[60px] font-mono text-xs sm:text-sm justify-center shrink-0"
            @click="resetZoom"
          />
          <UButton
            icon="i-lucide-zoom-in"
            size="sm"
            color="neutral"
            variant="ghost"
            class="shrink-0"
            aria-label="Zoom in"
            :disabled="!canZoomIn"
            @click="zoomIn"
          />

          <USeparator orientation="vertical" class="h-5 sm:h-6 shrink-0" />

          <UButton
            :icon="fitWidth ? 'i-lucide-arrow-down-left' : 'i-lucide-arrow-up-right'"
            size="sm"
            color="neutral"
            variant="ghost"
            class="shrink-0"
            :aria-label="fitWidth ? 'Disable fit to width' : 'Fit to width'"
            @click="toggleFitWidth"
          />
          <UButton
            icon="i-lucide-rotate-cw"
            size="sm"
            color="neutral"
            variant="ghost"
            class="shrink-0"
            aria-label="Rotate clockwise"
            @click="rotateCW"
          />
          <UButton
            :icon="viewMode === 'single' ? 'i-lucide-scroll' : 'i-lucide-square'"
            size="sm"
            color="neutral"
            variant="ghost"
            class="shrink-0"
            :aria-label="viewMode === 'single' ? 'Continuous scroll' : 'Single page'"
            @click="viewMode = viewMode === 'single' ? 'continuous' : 'single'"
          />
          <UButton
            :icon="isFullscreen ? 'i-lucide-shrink' : 'i-lucide-expand'"
            size="sm"
            color="neutral"
            variant="ghost"
            class="shrink-0"
            :aria-label="isFullscreen ? 'Exit full screen' : 'Full screen'"
            @click="toggleFullscreen"
          />
        </div>

        <USeparator class="sm:hidden block w-full opacity-50" />

        <!-- Bottom/Right Controls: Pagination -->
        <div class="flex items-center justify-between sm:justify-end gap-1 w-full sm:w-auto shrink-0">
          <div class="flex items-center">
            <UButton
              icon="i-lucide-chevrons-left"
              size="sm"
              color="neutral"
              variant="ghost"
              aria-label="First page"
              :disabled="!canPrev"
              @click="firstPage"
            />
            <UButton
              icon="i-lucide-chevron-left"
              size="sm"
              color="neutral"
              variant="ghost"
              aria-label="Previous page"
              :disabled="!canPrev"
              @click="prevPage"
            />
          </div>

          <div class="flex items-center gap-1 text-xs sm:text-sm text-ink-muted whitespace-nowrap">
            <UInput
              v-model="pageInput"
              size="xs"
              class="w-10 sm:w-12"
              :ui="{ base: 'text-center font-mono' }"
              aria-label="Page number"
              @keydown.enter="jumpToPage"
              @blur="jumpToPage"
            />
            <span>/ {{ totalPages }}</span>
          </div>

          <div class="flex items-center">
            <UButton
              icon="i-lucide-chevron-right"
              size="sm"
              color="neutral"
              variant="ghost"
              aria-label="Next page"
              :disabled="!canNext"
              @click="nextPage"
            />
            <UButton
              icon="i-lucide-chevrons-right"
              size="sm"
              color="neutral"
              variant="ghost"
              aria-label="Last page"
              :disabled="!canNext"
              @click="lastPage"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden relative">
      <Transition name="slide">
        <div
          v-if="activeSidebar !== 'none'"
          class="absolute left-0 top-0 bottom-0 z-10 w-56 sm:w-64 bg-surface border-r border-divider flex flex-col shadow-lg"
        >
          <div v-if="activeSidebar === 'toc'" class="p-3 flex-1 overflow-y-auto">
            <h3 class="text-sm font-semibold text-ink mb-2 sticky top-0 bg-surface z-10 py-1">Contents</h3>
            <div class="space-y-0.5">
              <button
                v-for="(item, i) in tocItems"
                :key="i"
                :style="{ paddingLeft: `${item.depth * 16 + 8}px` }"
                class="w-full text-left text-xs sm:text-sm py-1.5 pr-2 rounded hover:bg-surface-hover text-ink-muted hover:text-ink transition-colors truncate"
                @click="navigateToOutlineItem(item.original)"
              >
                {{ item.title }}
              </button>
            </div>
          </div>

          <div v-else-if="activeSidebar === 'thumbnails'" class="p-3 flex-1 overflow-y-auto bg-surface-subtle">
            <h3 class="text-sm font-semibold text-ink mb-2 sticky top-0 bg-surface-subtle z-10 py-1">Thumbnails</h3>
            <div class="flex flex-col gap-2 pb-4">
              <PDFThumbnail
                v-for="pageNum in totalPages"
                :key="pageNum"
                :pdf-doc="pdfDoc"
                :page-num="pageNum"
                :is-active="currentPage === pageNum"
                @click="goToPage(pageNum); if (isMobile) activeSidebar = 'none'"
              />
            </div>
          </div>
        </div>
      </Transition>

      <div
        class="flex-1 overflow-y-auto bg-surface-subtle p-2 sm:p-4"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <LoadingSpinner
          v-if="isLoading"
          :overlay="false"
          :center="true"
          size="lg"
          color="primary"
          text="Loading PDF..."
          class="py-12"
        />

        <div v-else-if="error" class="flex flex-col items-center justify-center py-12 text-center">
          <svg class="w-16 h-16 text-brand-danger mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-brand-danger font-medium mb-2">Error Loading PDF</p>
          <p class="text-ink-muted text-sm">{{ error }}</p>
        </div>

        <div
          v-else-if="viewMode === 'single'"
          class="flex flex-col items-center min-h-full"
          @contextmenu.prevent
        >
          <div class="my-auto flex flex-col items-center w-full">
            <div :class="['bg-surface shadow-card-hover rounded-token-lg overflow-hidden max-w-full transition-all', fitWidth ? 'w-full' : '']">
              <canvas ref="pdfCanvasRef" class="mx-auto block" />
            </div>

            <div class="flex items-center gap-2 mt-4 mb-2 sm:hidden">
              <UButton
                icon="i-lucide-chevron-left"
                size="sm"
                color="neutral"
                variant="outline"
                aria-label="Previous page"
                :disabled="!canPrev"
                @click="prevPage"
              />
              <span class="text-xs text-ink-muted font-mono min-w-[60px] text-center">
                {{ currentPage }} / {{ totalPages }}
              </span>
              <UButton
                icon="i-lucide-chevron-right"
                size="sm"
                color="neutral"
                variant="outline"
                aria-label="Next page"
                :disabled="!canNext"
                @click="nextPage"
              />
            </div>
          </div>
        </div>

        <div 
          v-else-if="viewMode === 'continuous'"
          class="flex flex-col items-center w-full pb-16"
          @contextmenu.prevent
        >
          <PDFPage
            v-for="pageNum in totalPages"
            :key="pageNum"
            :pdf-doc="pdfDoc"
            :page-num="pageNum"
            :scale="scale"
            :rotation="rotation"
            :fit-width="fitWidth"
            :container-width="containerWidth"
            :watermark-text="watermarkText"
            :watermark-options="watermarkOptions"
            @visible="handlePageVisible"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pdf-viewer-container {
  height: 100%;
  min-height: 100%;
}

.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.7);
}

.hide-scrollbars {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbars::-webkit-scrollbar {
  display: none;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
