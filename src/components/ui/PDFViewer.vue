<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const props = defineProps<{ src: string }>()

const isLoading = ref(true)
const error = ref<string | null>(null)

const { pdf, pages, info, getPDFDestination } = usePDF(props.src, {
  onProgress: ({ loaded, total }) => {
    if (loaded === total) isLoading.value = false
  },
  onError: (reason) => {
    error.value = `Failed to load PDF: ${reason}`
    isLoading.value = false
  }
})

const watermarkText = 'Property of ITTREnglish Course'
const watermarkOptions = { columns: 3, rows: 4, rotation: 45, fontSize: 15, color: 'rgba(100, 100, 100, 0.15)' }

const scale = ref(1)
const fitWidth = ref(false)
const rotation = ref(0)
const currentPage = ref(1)
const pageInput = ref('1')
const showToc = ref(false)
const isMobile = ref(false)

const zoomPct = computed(() => Math.round(scale.value * 100))
const canZoomIn = computed(() => scale.value < 2)
const canZoomOut = computed(() => scale.value > 0.5)
const totalPages = computed(() => pages.value || 0)
const canPrev = computed(() => currentPage.value > 1)
const canNext = computed(() => currentPage.value < totalPages.value)

const tocItems = computed(() => {
  const outline = (info.value as any)?.outline
  if (!outline || !Array.isArray(outline)) return []
  const flat: Array<{ title: string; depth: number; original: any }> = []
  function walk(items: any[], depth: number) {
    for (const item of items) {
      flat.push({ title: item.title, depth, original: item })
      if (item.items?.length) walk(item.items, depth + 1)
    }
  }
  walk(outline, 0)
  return flat
})

function zoomIn() {
  if (canZoomIn.value) { scale.value = Math.min(scale.value + 0.25, 2); fitWidth.value = false }
}
function zoomOut() {
  if (canZoomOut.value) { scale.value = Math.max(scale.value - 0.25, 0.5); fitWidth.value = false }
}
function resetZoom() { scale.value = 1; fitWidth.value = false }
function toggleFitWidth() { fitWidth.value = !fitWidth.value; if (fitWidth.value) scale.value = 1 }
function rotateCW() { rotation.value = (rotation.value + 90) % 360 }

function goToPage(n: number) {
  const p = Math.max(1, Math.min(n, totalPages.value))
  currentPage.value = p
  pageInput.value = String(p)
}
function prevPage() { if (canPrev.value) goToPage(currentPage.value - 1) }
function nextPage() { if (canNext.value) goToPage(currentPage.value + 1) }
function firstPage() { goToPage(1) }
function lastPage() { goToPage(totalPages.value) }
function jumpToPage() {
  const n = parseInt(pageInput.value)
  if (!isNaN(n)) goToPage(n)
}

async function navigateToOutlineItem(item: any) {
  if (item.dest) {
    const pageNum = await getPDFDestination(item.dest)
    if (pageNum) goToPage(pageNum)
  }
  showToc.value = false
}

let mql: MediaQueryList | null = null
onMounted(() => {
  mql = window.matchMedia('(max-width: 767px)')
  isMobile.value = mql.matches
  mql.addEventListener('change', (e) => { isMobile.value = e.matches })
  if (isMobile.value) fitWidth.value = true
})
onUnmounted(() => { mql?.removeEventListener('change', () => {}) })

function handleKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prevPage() }
  else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); nextPage() }
  else if (e.key === 'Home') { e.preventDefault(); firstPage() }
  else if (e.key === 'End') { e.preventDefault(); lastPage() }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

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
  isLoading.value = true
  error.value = null
  scale.value = 1
  rotation.value = 0
  currentPage.value = 1
  pageInput.value = '1'
  fitWidth.value = isMobile.value
})
</script>

<template>
  <div class="pdf-viewer-container flex flex-col h-full">
    <div class="sticky top-0 z-20 bg-surface border-b border-divider px-2 sm:px-3 py-1.5 sm:py-2 shadow-card-rest">
      <div class="flex items-center gap-1 sm:gap-2">
        <UButton
          v-if="tocItems.length"
          :icon="showToc ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left-open'"
          size="sm"
          color="neutral"
          variant="ghost"
          aria-label="Table of contents"
          @click="showToc = !showToc"
        />

        <USeparator v-if="tocItems.length" orientation="vertical" class="h-5 sm:h-6" />

        <UButton
          icon="i-lucide-zoom-out"
          size="sm"
          color="neutral"
          variant="ghost"
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
          class="min-w-[52px] sm:min-w-[60px] font-mono text-xs sm:text-sm justify-center"
          @click="resetZoom"
        />
        <UButton
          icon="i-lucide-zoom-in"
          size="sm"
          color="neutral"
          variant="ghost"
          aria-label="Zoom in"
          :disabled="!canZoomIn"
          @click="zoomIn"
        />

        <USeparator orientation="vertical" class="h-5 sm:h-6" />

        <UButton
          :icon="fitWidth ? 'i-lucide-arrow-down-left' : 'i-lucide-arrow-up-right'"
          size="sm"
          color="neutral"
          variant="ghost"
          :aria-label="fitWidth ? 'Disable fit to width' : 'Fit to width'"
          @click="toggleFitWidth"
        />
        <UButton
          icon="i-lucide-rotate-cw"
          size="sm"
          color="neutral"
          variant="ghost"
          aria-label="Rotate clockwise"
          @click="rotateCW"
        />

        <div class="flex-1" />

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
          <span class="hidden sm:inline">/ {{ totalPages }}</span>
          <span class="sm:hidden">/{{ totalPages }}</span>
        </div>

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

    <div class="flex flex-1 overflow-hidden relative">
      <Transition name="slide">
        <div
          v-if="showToc && tocItems.length"
          class="absolute left-0 top-0 bottom-0 z-10 w-56 sm:w-64 bg-surface border-r border-divider overflow-y-auto shadow-lg"
        >
          <div class="p-3">
            <h3 class="text-sm font-semibold text-ink mb-2">Contents</h3>
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
          v-else
          class="flex flex-col items-center min-h-full"
          @contextmenu.prevent
        >
          <div class="bg-surface shadow-card-hover rounded-token-lg overflow-hidden max-w-full">
            <VuePDF
              :pdf="pdf"
              :page="currentPage"
              :scale="fitWidth ? 1 : scale"
              :fit-parent="fitWidth"
              :rotation="rotation"
              :watermark-text="watermarkText"
              :watermark-options="watermarkOptions"
            />
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
