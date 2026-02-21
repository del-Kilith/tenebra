const GemColours = ['#e3e0e0', '#f18196', '#D597B4']
const GemRadii = { max: 25, min: 10 }
const GemOffset = 3

/**
 * Creates a new gem object
 *
 * @param cX the center X coordinate of the gem on the screen
 * @param cY the center Y coordinate of the gem on the screen
 * @param radius the radius of the girdle of the gem
 * @param colour the colour of the gem
 */
function Gem(cX, cY, radius, colour) {
  const crownFactor = 0.65
  const cuts = Random.intRange(11, 8)
  const ring = Array.ofSize(cuts)
    .map((_, i) => i * 2 * Math.PI / cuts)
    .map(w => ({ x: radius * Math.cos(w), y: radius * Math.sin(w), z: 0 }))

  const mesh = {
    crown: ring.map(p => ({
      x: p.x * crownFactor,
      y: p.y * crownFactor,
    })),
    girdle: ring.map(p => ({
      x: p.x,
      y: p.y,
      z: 0
    }))
  }

  const starRadiusFactor = -1 + radius / GemRadii.max
  return {
    radius,
    center: { x: cX, y: cY },
    cuts,
    mesh,
    colour: colour,
    starsRadius: Array.ofSize(cuts * 2)
      .map(() => Random.fltRange(2.6 + starRadiusFactor, 1.6 + starRadiusFactor)),
  }
}

/**
 * Given a set of relations defined by a radius and an angular offset
 * creates a new set of gems with their coordinates properly calculated
 *
 * @param relations the set of relations
 * @returns {*} the set of gems
 */
function BuildGemConstellation(relations, rotation = 0 * Math.PI / 180) {
  let x = 0
  let y = 0
  return relations
    .map((p, i) => ({
      ...p,
      r: p.r * (GemRadii.max - GemRadii.min) + GemRadii.min,
      a: -Math.PI * (p.a / 180 + i / relations.length + 0.5)
    }))
    .map((p, i, relations) => {
      const q = relations[i - 1] ?? undefined
      const o = p.r + (q?.r ?? 0) + GemOffset

      x += Math.cos(p.a) * o
      y += Math.sin(p.a) * o

      const rx = x * Math.cos(rotation) - y * Math.sin(rotation)
      const ry = x * Math.sin(rotation) + y * Math.cos(rotation)

      return Gem(rx, ry, p.r, p.c)
    })
}

function GemConstellation_PreRender(context, gems) {
  gems.filter(gem => gem.image)
    .forEach(gem => {
      context.save()
      context.beginPath()
      gem.mesh.girdle.forEach(p => context.lineTo(p.x, p.y))
      context.closePath()
      context.clip()
      const imgW = gem.image.width
      const imgH = gem.image.height
      const aspect = imgW / imgH

      const diameter = gem.radius * 2

      let w, h
      if (imgW < imgH) {
        w = diameter
        h = diameter / aspect
      } else {
        h = diameter
        w = diameter * aspect
      }

      context.drawImage(gem.image, gem.center.x - w / 2, gem.center.y - h / 2, w, h)
      context.restore()
    })

  gems.forEach(gem => {
    context.strokeStyle = gem.colour + '30'
    context.fillStyle = gem.colour + '80'

    context.beginPath()
    gem.mesh.crown.forEach(p => context.lineTo(p.x, p.y))
    context.closePath()
    context.stroke()

    gem.mesh.crown.forEach((p, i) => {
      context.beginPath()
      context.arc(p.x, p.y, gem.starsRadius[i], 0, Math.PI * 2, false)
      context.closePath()
      context.fill()
    })

    gem.mesh.girdle.forEach((p, i) => {
      context.beginPath()
      context.arc(p.x, p.y, gem.starsRadius[i + gem.mesh.crown.length], 0, Math.PI * 2, false)
      context.closePath()
      context.fill()
    })

    context.fillStyle = gem.colour + (gem.image ? '20' : '0a')
    context.beginPath()
    gem.mesh.girdle.forEach(p => context.lineTo(p.x, p.y))
    context.closePath()
    context.stroke()
    context.fill()

    for (let i = 0; i < gem.cuts; i++) {
      context.beginPath()
      context.lineTo(gem.mesh.crown[i].x, gem.mesh.crown[i].y)
      context.lineTo(gem.mesh.girdle[i].x, gem.mesh.girdle[i].y)
      context.closePath()
      context.stroke()
    }
  })
}

let loadedImages = 0
const LoadedImagePromises = Images.map(src => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = src

    img.onload = () => {
      Debug.setLoadedImages(++loadedImages)
      resolve(img)
    }

    img.onerror = reject
  })
})

function GemConstellation() {
  const gems = BuildGemConstellation([
    { r: 0.80, a:   0, c: GemColours[0] },
    { r: 0.70, a:  50, c: GemColours[1] },
    { r: 1.00, a: 130, c: GemColours[0] },
    { r: 0.60, a:  60, c: GemColours[2] },
    { r:    0, a: 135, c: GemColours[0] },
    { r: 0.20, a:  75, c: GemColours[2] },
    { r: 0.60, a:  50, c: GemColours[0] },
    { r: 0.80, a: 158, c: GemColours[2] },
    { r: 0.65, a:  55, c: GemColours[0] },
    { r: 1.00, a:  95, c: GemColours[2] },
    { r: 0.00, a:  25, c: GemColours[0] },
    { r: 0.82, a: 103, c: GemColours[1] },
    { r: 0.70, a: 105, c: GemColours[0] },
  ])

  const bounds = gems.reduce(
    (b, p) => ({
      minX: Math.min(b.minX, p.center.x - p.radius),
      maxX: Math.max(b.maxX, p.center.x + p.radius),
      minY: Math.min(b.minY, p.center.y - p.radius),
      maxY: Math.max(b.maxY, p.center.y + p.radius),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  )

  const width  = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY

  const padding = 0.1
  const scale = Math.min(
    window.innerWidth / width,
    window.innerHeight / height
  ) * (1 - padding)

  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerY = (bounds.minY + bounds.maxY) / 2
  const screenCX = window.innerWidth / 2
  const screenCY = window.innerHeight / 2

  const scaledGems = gems.map(gem => ({
    ...gem,
    radius: gem.radius * scale,
    center: {
      x: (gem.center.x - centerX) * scale + screenCX,
      y: (gem.center.y - centerY) * scale + screenCY
    },
    mesh: {
      crown: gem.mesh.crown.map(p => ({
        x: (gem.center.x + p.x - centerX) * scale + screenCX,
        y: (gem.center.y + p.y - centerY) * scale + screenCY,
      })),
      girdle: gem.mesh.girdle.map(p => ({
        x: (gem.center.x + p.x - centerX) * scale + screenCX,
        y: (gem.center.y + p.y - centerY) * scale + screenCY,
      })),
    }
  }))

  const canvas = document.createElement('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const AlphaDuration = 500
  let startTime = 0
  let alpha = 0
  let hasInitializedImages = false
  const lerp = (a, b, t) => a + (b - a) * t

  Promise.all(LoadedImagePromises).then(images => {
    Array.ofSize(13).map((_, i) => i).forEach(n => {
      scaledGems[n].image = images[images.length - 1 - n]
    })

    GemConstellation_PreRender(canvas.getContext('2d'), scaledGems)
    hasInitializedImages = true
  })

  return {
    update: function (dt) {
      if (!hasInitializedImages) {
        return
      }
      if (!startTime) {
        startTime = Simulation.Time
      }
      const elapsed = Simulation.Time - startTime
      const t = Math.min(elapsed / AlphaDuration, 1)
      alpha = lerp(0, 1, t)
    },
    render: (context) => {
      context.globalAlpha = alpha
      context.drawImage(canvas, 0, 0, canvas.width, canvas.height)
    }
  }
}
