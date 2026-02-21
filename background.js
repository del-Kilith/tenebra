const NoiseMapCanvas = document.createElement('canvas')
NoiseMapCanvas.style.visibility = 'hidden'
NoiseMapCanvas.width = window.innerWidth
NoiseMapCanvas.height = window.innerHeight

window.addEventListener('resize', () => {
  NoiseMapCanvas.width = window.innerWidth
  NoiseMapCanvas.height = window.innerHeight
  renderNoiseMapInCanvas()
})

// Generate a noise map
const noiseMapContext = NoiseMapCanvas.getContext('2d')
const noise = Noise(30, 30)

function renderNoiseMapInCanvas() {
  const image = context.createImageData(NoiseMapCanvas.width, NoiseMapCanvas.height)
  const color = [1, 3, 5].map(i => '#230a25'.substring(i, i + 2)).map(s => parseInt(s, 16))

  for (let r = 0; r < NoiseMapCanvas.height; r++) {
    const r_i = Math.floor(r / window.innerHeight * noise.length)
    for (let c = 0; c < NoiseMapCanvas.width; c++) {
      const c_i = Math.floor(c / window.innerWidth * noise[r_i].length)
      const a = noise[r_i][c_i] * 255
      const i = (r * NoiseMapCanvas.width + c) * 4

      image.data[i + 0] = color[0]
      image.data[i + 1] = color[1]
      image.data[i + 2] = color[2]
      image.data[i + 3] = a
    }
  }

  noiseMapContext.putImageData(image, 0, 0)
}

const SparklesCanvas = document.createElement('canvas')
SparklesCanvas.style.visibility = 'hidden'
SparklesCanvas.width = window.innerWidth
SparklesCanvas.height = window.innerHeight

window.addEventListener('resize', () => {
  SparklesCanvas.width = window.innerWidth
  SparklesCanvas.height = window.innerHeight
  renderSparkles()
})

const MaxSparkles = 400
const MinSparkles = 300
const SparkleColors = Random.distribution([
  [0.10, '#ed3582'],
  [0.07, '#e880b8'],
  [0.10, '#f18ca7'],
  [0.10, '#f3e7ce'],
  [0.23, '#f1c2a9'],
  [0.40, '#e48449'],
])

const stars = Array.ofSize(Random.intRange(MaxSparkles, MinSparkles))
  .map(_ => SparklingStar())
  .reduce((a, c) => ({ ...a, [c.distance]: [...(a[c.distance] ?? []), c] }), {})

function renderSparkles() {
  const context = SparklesCanvas.getContext('2d')

  for (const group in stars) {
    if (group === '1') { context.filter = 'blur(1px)' }
    if (group === '2') { context.filter = 'blur(2px)' }
    if (group === '3') { context.filter = 'blur(3px)' }
    if (group === '4') { context.filter = 'blur(4px)' }
    for (const star of stars[group]) {
      context.fillStyle = star.colour
      context.beginPath()
      context.arc(star.x, star.y, star.r, 0, Math.PI * 2, false)
      context.fill()
    }
  }
}

function SparklingStar() {
  return {
    x: Random.intRange(window.innerWidth),
    y: Random.intRange(window.innerHeight),
    r: Random.intRange(4, 2),
    distance: Random.intRange(5, 1),
    colour: SparkleColors.next()
  }
}

function Background_Render(context) {
  context.filter = 'blur(128px)'
  context.drawImage(NoiseMapCanvas, 0, 0)

  context.filter = 'blur(0)'
  context.drawImage(SparklesCanvas, 0, 0)
}

function Background() {
  renderNoiseMapInCanvas()
  renderSparkles()

  return {
    render: context => Background_Render(context),
  }
}


/**
 * Perlin noise implementation
 */
function Noise(rows, cols, scale = 10) {
  const gradients = {}

  const randomVector = () => {
    const a = Math.random() * 2 * Math.PI
    return { x: Math.cos(a), y: Math.sin(a) }
  }

  const gradient = (ix, iy) => {
    const key = `${ix},${iy}`
    if (!gradients[key]) gradients[key] = randomVector()
    return gradients[key]
  }

  const dotGrid = (x, y, ix, iy) => {
    const g = gradient(ix, iy)
    const dx = x - ix
    const dy = y - iy
    return dx * g.x + dy * g.y
  }

  const smoothstep = t =>
    t * t * t * (t * (t * 6 - 15) + 10)

  const lerp = (t, a, b) =>
    a + t * (b - a)

  const result = []

  for (let y = 0; y < rows; y++) {
    result[y] = []
    for (let x = 0; x < cols; x++) {
      const fx = x / scale
      const fy = y / scale

      const x0 = Math.floor(fx)
      const x1 = x0 + 1
      const y0 = Math.floor(fy)
      const y1 = y0 + 1

      const sx = smoothstep(fx - x0)
      const sy = smoothstep(fy - y0)

      const n0 = dotGrid(fx, fy, x0, y0)
      const n1 = dotGrid(fx, fy, x1, y0)
      const ix0 = lerp(sx, n0, n1)

      const n2 = dotGrid(fx, fy, x0, y1)
      const n3 = dotGrid(fx, fy, x1, y1)
      const ix1 = lerp(sx, n2, n3)

      const value = lerp(sy, ix0, ix1)

      result[y][x] = (value + 1) / 2
    }
  }

  return result
}

