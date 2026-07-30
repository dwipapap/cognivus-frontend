import type { PDFPageProxy, RenderTask } from 'pdfjs-dist'

/**
 * Size a canvas to a viewport at device pixel ratio and start the render.
 * Shared by PDFPage and PDFThumbnail — the only part of their pipelines that
 * was genuinely identical. Their observer strategy and re-render triggers
 * differ enough that merging the components would need a mode flag.
 */
export function renderPageToCanvas(
  page: PDFPageProxy,
  canvas: HTMLCanvasElement,
  viewport: { width: number; height: number }
): { task: RenderTask; ctx: CanvasRenderingContext2D } | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const outputScale = window.devicePixelRatio || 1

  canvas.width = Math.floor(viewport.width * outputScale)
  canvas.height = Math.floor(viewport.height * outputScale)
  canvas.style.width = Math.floor(viewport.width) + 'px'
  canvas.style.height = Math.floor(viewport.height) + 'px'

  const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined

  const task = page.render({
    canvasContext: ctx,
    viewport: viewport as any,
    transform: transform as any
  })

  return { task, ctx }
}

/** pdf.js throws this whenever a render is superseded; it is not an error. */
export const isRenderCancellation = (err: any) => err?.name === 'RenderingCancelledException'
