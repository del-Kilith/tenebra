const FallingStarSpawnChance = 0.0125
const DeepSpaceStarChance = 0.65
const TailColours = Random.distribution([
  [0.225, 'rgb(230,160, 80)'],
  [0.225, 'rgb(239,155,203)'],
  [0.05 , 'rgb(155,189,239)'],
  [0.225, 'rgb(237,152,164)'],
  [0.225, 'rgb(226,168,239)'],
  [0.05 , 'rgb(168,239,233)'],
])

function FallingStar() {
  const tailLength = Random.intRange(400, 200)
  const head = {
    x: Random.fltRange(window.innerWidth * 2, window.innerWidth),
    y: Random.fltRange(0, -window.innerHeight),
  }

  const k = Random.intRange(1400, 1000)
  const theta = -Math.random() * Math.PI
  const velocity = {
    x: Math.cos(theta) * k,
    y: Math.sin(theta) * k,
    angle: theta
  }

  if (velocity.x < 0) {
    head.x *= -1
  }

  return {
    head,
    tail: {
      x: head.x + Math.cos(velocity.angle) * tailLength,
      y: head.y + Math.sin(velocity.angle) * tailLength
    },
    tailLength,
    velocity,
    colour: TailColours.next(),
    isDeepSpace: Math.random() < DeepSpaceStarChance
  }
}

function FallingStars_update(dt, stars) {
  if (Math.random() < FallingStarSpawnChance) {
    stars.push(FallingStar())
  }

  return stars
    .filter(star => star.tail.y < window.innerHeight)
    .map(star => ({
      ...star,
      head: {
        x: star.head.x - star.velocity.x * dt,
        y: star.head.y - star.velocity.y * dt,
      },
      tail: {
        x: star.head.x + Math.cos(star.velocity.angle) * star.tailLength,
        y: star.head.y + Math.sin(star.velocity.angle) * star.tailLength
      }
    }))
}
function FallingStars_render(context, stars) {
  stars
    .forEach(({ head, tail, colour, isDeepSpace }) => {
      context.fillStyle = colour

      if (isDeepSpace) {
        context.filter = 'blur(3px)'
      } else {
        context.filter = 'blur(0)'
      }

      context.beginPath()
      context.moveTo(tail.x, tail.y)
      context.lineTo(head.x + 2, head.y + 2)
      context.lineTo(head.x - 2, head.y + 2)
      context.lineTo(tail.x, tail.y)
      context.fill()
    })
}

function FallingStars() {
  let stars = []

  return {
    update: dt => {
      stars = FallingStars_update(dt, stars)
      Debug.setFallingStars(stars.length)

    },
    render: context => FallingStars_render(context, stars),
  }
}
