import { activeScene, canvasPreviewRef, nodeRegistry, studioData } from '@/state'
import { screenNodeTypes, stageSize, textLineHeight } from '@/enums'
import { sortNodesByOrder } from '@/composables/NodeOrder'
import type { TNode, TTextNodeData } from '@/types'

let context: CanvasRenderingContext2D = null
let running = false
let timer: ReturnType<typeof setTimeout> = null
let nextFrameAt = 0
let getFps = () => 30

function getContext(canvas: HTMLCanvasElement) {
  if (!context || context.canvas != canvas) {
    // Yayın görüntüsü opaktır; alpha kapalıyken çizim ve yakalama daha hızlıdır.
    context = canvas.getContext('2d', { alpha: false })
  }

  return context
}

function drawMedia(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  node: TNode,
  element: HTMLElement,
  kx: number,
  ky: number
) {
  // offsetWidth/Height CSS ölçeklemesinden etkilenmez; mantıksal boyutu verir.
  ctx.drawImage(source, node.position.x * kx, node.position.y * ky, element.offsetWidth * kx, element.offsetHeight * ky)
}

/**
 * Metni editördeki (DOM) yerleşimle aynı şekilde çizer: her satır ayrı satıra,
 * satır yüksekliği ve taban çizgisi CSS'teki gibi (line-height: textLineHeight) hesaplanır.
 */
function drawText(ctx: CanvasRenderingContext2D, node: TNode, kx: number, ky: number) {
  const data = node.data as TTextNodeData
  const fontSize = data.style.fontSize * kx
  const lineHeight = fontSize * textLineHeight

  ctx.font = `${fontSize}px ${data.style.fontFamily}`
  ctx.fillStyle = data.style.color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  const metrics = ctx.measureText('Hg')
  const ascent = metrics.fontBoundingBoxAscent ?? fontSize * 0.8
  const descent = metrics.fontBoundingBoxDescent ?? fontSize * 0.2
  const baseline = (lineHeight - (ascent + descent)) / 2 + ascent

  data.text.split('\n').forEach((line, index) => {
    ctx.fillText(line, node.position.x * kx, node.position.y * ky + index * lineHeight + baseline)
  })
}

function drawNode(ctx: CanvasRenderingContext2D, node: TNode, element: HTMLElement, kx: number, ky: number) {
  switch (node.type) {
    case screenNodeTypes.text:
      drawText(ctx, node, kx, ky)
      break

    case screenNodeTypes.image:
    case screenNodeTypes.background: {
      const image = element.querySelector('img')
      // Yüklenemeyen (broken) resim drawImage'da hata fırlatır; çizilmez.
      if (image?.complete && image.naturalWidth > 0) {
        drawMedia(ctx, image, node, element, kx, ky)
      }
      break
    }

    case screenNodeTypes.video:
    case screenNodeTypes.sourceMedia:
    case screenNodeTypes.liveCamera: {
      const video = element.querySelector('video')
      if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        drawMedia(ctx, video, node, element, kx, ky)
      }
      break
    }
  }
}

/** Aktif sahneyi yayın canvas'ına (çıkış çözünürlüğünde) çizer. */
function render() {
  const canvas = canvasPreviewRef.value
  if (!canvas) {
    return
  }

  const ctx = getContext(canvas)
  const { width, height } = canvas
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)

  const scene = studioData.value.scene[activeScene.value]
  if (!scene) {
    return
  }

  const kx = width / stageSize.width
  const ky = height / stageSize.height

  for (const node of sortNodesByOrder(scene.nodes)) {
    const element = nodeRegistry.get(node.id)?.getNodeElement()
    if (!element) {
      continue
    }

    try {
      drawNode(ctx, node, element, kx, ky)
    } catch (error) {
      // Tek bir kaynaktaki sorun karenin geri kalanının çizilmesini engellememeli.
      console.warn('[render] node could not be drawn', node.id, error)
    }
  }
}

function tick() {
  if (!running) {
    return
  }

  render()

  // requestAnimationFrame pencere küçültülünce durur ve ekran tazeleme hızında çalışır;
  // yayın için kareler, yayın FPS'inde çalışan bir zamanlayıcı ile çizilir.
  const now = performance.now()
  nextFrameAt += 1000 / getFps()
  if (nextFrameAt < now) {
    nextFrameAt = now
  }

  timer = setTimeout(tick, nextFrameAt - now)
}

export function useCanvasRendering() {
  function start(fps: () => number) {
    getFps = fps
    if (running) {
      return
    }

    running = true
    nextFrameAt = performance.now()
    tick()
  }

  function stop() {
    running = false
    clearTimeout(timer)
    timer = null
  }

  return {
    start,
    stop,
    render,
  }
}
