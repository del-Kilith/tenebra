function TypeWriting(delayBeforeEnding, text) {
  text = text.split('\n').filter(s => s && s.replaceAll(' ', ''))

  const container = document.querySelector('.container')
  let span

  const wps = Random.fltRange(30, 24) / 400
  let llt = Simulation.Time
  let lli = 0
  let cro = 0

  let endTime = 0

  return {
    update: function(dt) {
      if (endTime !== 0) {
        const willTerminate = Simulation.Time - endTime > delayBeforeEnding
        if (willTerminate) {
          Array.from(container.children).forEach(child => child.remove())
        }
        return willTerminate
      }
      if ((Simulation.Time - llt) / 1000 < wps) {
        return
      }
      if (!span) {
        span = container.appendChild(document.createElement('span'))
      }
      // Write the current character
      span.textContent += text[cro][lli]
      llt = Simulation.Time
      lli = lli + 1
      if (lli < text[cro].length) {
        return
      }
      // Update new line
      cro = cro + 1
      lli = 0
      span = undefined
      if (cro < text.length) {
        return
      }
      endTime = Simulation.Time
    }
  }
}

const preBackgroundColor = `#0f040f`
function ColorShift(duration, data) {
  const hexToRgb = hex => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  })

  const rgbToHex = ({ r, g, b }) =>
    `#${[r, g, b]
      .map(v => Math.round(v).toString(16).padStart(2, '0'))
      .join('')}`

  const lerp = (a, b, t) => a + (b - a) * t

  const finalColor = preBackgroundColor
  const initialColors = ['#ffa5d5', '#ffafaf', '#ffd79f']
  const finalColors = [finalColor, finalColor, finalColor]

  const initialRGB = initialColors.map(hexToRgb)
  const finalRGB = finalColors.map(hexToRgb)

  let startTime = 0
  return {
    update: function (dt) {
      if (!startTime) {
        startTime = Simulation.Time
      }

      const elapsed = Simulation.Time - startTime
      if (elapsed >= duration) {
        document.body.classList.add('onDark')
        data.createFillStyle = (context, alpha) => {
          return finalColor
        }
        return true
      }

      const t = Math.min(elapsed / duration, 1)


      const currentColors = initialRGB.map((start, i) => {
        const end = finalRGB[i]
        return rgbToHex({
          r: lerp(start.r, end.r, t),
          g: lerp(start.g, end.g, t),
          b: lerp(start.b, end.b, t)
        })
      })

      data.createFillStyle = (context, alpha) => {
        const gradient = context.createLinearGradient(0, 0, context.canvas.width, context.canvas.height)
        gradient.addColorStop(0, currentColors[0])
        gradient.addColorStop(alpha, currentColors[1])
        gradient.addColorStop(1, currentColors[2])
        return gradient
      }
    }
  }
}

function ShiftToBackground(data) {
  let startTime = 0
  let stepStartTime = 0
  const flickerTiming = [
    50,  // show for 100
    100, // hide for 500ms
    100, // show for 100ms
    50,  // show for 50ms
    50,  // hide for 50ms
    50,  // show for 50ms
    50,  // hide for 50ms
    50,  // show for 50ms
    1000,// hide for 50ms
  ]
  let show = false
  let flickerIndex = 0
  return {
    update: function (dt) {
      if (!startTime) {
        startTime = Simulation.Time
        stepStartTime = Simulation.Time
        addSimulationObject(Background(), 'Background', -1)
        addSimulationObject(FallingStars(), 'FallingStars', 0)
      }

      const elapsed = Simulation.Time - stepStartTime
      if (elapsed >= flickerTiming[flickerIndex]) {
        flickerIndex++
        show = !show
        stepStartTime = Simulation.Time
      }
      if (flickerIndex === flickerTiming.length) {
        data.createFillStyle = undefined
        return true
      }

      data.createFillStyle = (context, alpha) => {
        return preBackgroundColor + (show ? '00' : 'ff')
      }
    }
  }
}

function Delay(duration) {
  let startTime = 0
  return {
    update: function (dt) {
      if (!startTime) {
        startTime = Simulation.Time
      }
      const elapsed = Simulation.Time - startTime
      if (elapsed >= duration) {
        return true
      }
    }
  }
}

function FadeOut(duration) {
  let opacity = 1
  let startTime = 0
  return {
    update: function (dt) {
      if (!startTime) {
        startTime = Simulation.Time
      }
      opacity = Math.max(0, 1 - (Simulation.Time - startTime) / duration)
      return opacity === 0
    },
    render: function (context) {
      context.globalAlpha = opacity
    }
  }
}

function LastTransition() {
  return {
    update: function (dt) {
      addSimulationObject(GemConstellation(), 'GemConstellation', 1)
      removeSimulationObject('Animations')
      document.querySelector('.container').remove()
    }
  }
}

function Animations() {
  const data = {
    createFillStyle: (context, alpha) => {
      const gradient = context.createLinearGradient(0, 0, context.canvas.width, context.canvas.height)
      gradient.addColorStop(0, '#ffa5d5')
      gradient.addColorStop(alpha, '#ffafaf')
      gradient.addColorStop(1, '#ffd79f')
      return gradient
    }
  }
  const states = [
    TypeWriting(1000, `
      Hey peaches,
      Happy Valentines!
    `),
    TypeWriting(1000, `
      It's been a while, hasn't it?
    `),
    TypeWriting(1000, `
      Ideas don't grow on trees, you know?
      Last year I gave you colors,
      beating that is quite difficult.
    `),
    TypeWriting(1000, `
      I thought long and hard
      -
      What might be better than colors?
    `),
    TypeWriting(500, `
      I haven't found an answer yet,
      but I got pretty close...
    `),
    TypeWriting(500, `
      I think?
    `),
    TypeWriting(1000, `
      But first, a color shift is in order!
      We can't be reusing colors, now, can we?
    `),
    ColorShift(4000, data),
    Delay(500),
    TypeWriting(500, `
      ...
    `),
    TypeWriting(1000, `
      That's a bit boring...
      -
      Can we get a little decor in here?
    `),
    Delay(2000),
    TypeWriting(1000, `
      Hello?
    `),
    Delay(2000),
    TypeWriting(500, `
      Is this thing broken?
    `),
    Delay(2000),
    TypeWriting(2000, `
      *sigh*
    `),
    Delay(2000),
    ShiftToBackground(data),
    Delay(5000),
    TypeWriting(1000, `
      Oh! That's better!
    `),
    TypeWriting(1000, `
      Now, before I let you go,
      there's a few things I want to say.
    `),
    TypeWriting(1000, `
      The last year we spent together
      has been a joy to live through. 
    `),
    TypeWriting(1000, `
      We laughed and we cried,
      we dreamt and we argued
      -
      We shared a quiet moment
      under a blanket, just us.
    `),
    TypeWriting(1000, `
      So much happened and yet there's
      so much more to come still.
      -
      The future is exciting!
    `),
    TypeWriting(1000, `
      We gave it our best,
      through thick and thin.
    `),
    TypeWriting(1000, `
      I would not ask for anyone else
      to see this through with me.
    `),
    TypeWriting(1000, `
      Sometimes we'll struggle,
      Sometimes we'll argue,
      Sometimes we'll disagree.
      -
      and yet...
    `),
    TypeWriting(1000, `
      I know we can make it work.
      -
      Because we both love each other truly,
      because we both know how rare this is,
      because we both understand,
      what we have is worth fighting for.
    `),
    TypeWriting(500, `
      So.
    `),
    TypeWriting(500, `
      Let me give you one more thing.
      -
      A little celebration of this last year,
      a little celebration of us.
    `),
    TypeWriting(3000, `
      I love you.
      ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀— Alessandro
    `),  // Previous row contains invisible unicode spaces!,
    Delay(1000),
    TypeWriting(3000, `
      I wonder, if the day we started talking,
      the stars looked down at us and thought
      
      ‘they finally met’
    `),
    LastTransition()
  ]
  let index = 0

  const alphaMax = 0.75
  const alphaMin = 0.25
  let alpha = 0.25
  let increasing = true

  return {
    update: function (dt) {
      alpha += increasing ? 0.005 : -0.0005
      if (alpha >= alphaMax) {
        increasing = false
      }
      if (alpha <= alphaMin) {
        increasing = true
      }

      const state = states[index]
      const hasFinished = state.update?.(dt)
      index = index + (hasFinished ? 1 : 0)

      if (index === states.length) {
        removeSimulationObject(this.label)
      }
    },
    render: function (context) {
      const state = states[index]
      state.render?.(context)

      if (data.createFillStyle) {
        context.fillStyle = data.createFillStyle(context, alpha)
        context.fillRect(0, 0, context.canvas.width, context.canvas.height)
      }
    }
  }
}
