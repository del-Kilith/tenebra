const Simulation = {
  Time: 0,
  Physics: {
    Step: 1 / 60,
    StepInMilliseconds: 0,
    accumulator: 0
  },
  Frames: {
    SpikeThreshold: 55,
    SampleRate: 8,
    last: performance.now(),
    spikes: 0,
    fps: 0,
    count: 0,
  },
}

Simulation.Physics.StepInMilliseconds = Simulation.Physics.Step * 1000

function frame(now) {
  const Frames = Simulation.Frames

  // Handle FPS debug info
  const fps = 1000 / (now - Frames.last)
  if (Frames.count % Frames.SampleRate === 0) {
    Debug.setFPS(fps)
  }
  if (fps < Frames.SpikeThreshold) {
    Debug.setFrameSpikes(Frames.spikes++)
  }

  // Calculate frame time and stuff
  Simulation.Physics.accumulator += now - Frames.last
  Frames.last = now
  Frames.count = Frames.count + 1
  Debug.setSimulationTime(Simulation.Time)

  // Update physics depending on time elapsed since last update
  const StepInMilliseconds = Simulation.Physics.StepInMilliseconds
  while (Simulation.Physics.accumulator >= StepInMilliseconds) {
    Physics.update(Simulation.Physics.Step)
    Simulation.Physics.accumulator -= StepInMilliseconds
    Simulation.Time += StepInMilliseconds
  }

  // Render
  Renderer.render(
    Simulation.Physics.accumulator / Simulation.Physics.Step,
    []
  )
  requestAnimationFrame(frame)
}

function addSimulationObject(object, label = undefined, zIndex = 0) {
  if ('update' in object) {
    Physics.add(object)
    label && console.log(label, 'was registered for physics')
  }
  if ('render' in object) {
    Renderer.add(object, label, zIndex)
    label && console.log(label, 'was registered for rendering')
  }
}

function removeSimulationObject(label) {
  Physics.sub(label)
  console.log(label, 'was removed from physics')
  Renderer.sub(label)
  console.log(label, 'was removed from rendering')
}

// TODO: review text
// TODO: add golden lines going from one gem to the other
// TODO: gems should move?
// addSimulationObject(Background(), 'Background')
// addSimulationObject(FallingStars(), 'FallingStars')
// addSimulationObject(GemConstellation(), 'GemConstellation')
addSimulationObject(Animations(), 'Animations', 999)

;(async function() {
  const wakeLock = await navigator.wakeLock.request("screen").catch(() => undefined)
  wakeLock?.addEventListener('release', () => Debug.setWakeLock(false))
  Debug.setWakeLock(!!wakeLock)
})()

Debug.setSampleRate(Simulation.Frames.SampleRate)
frame(performance.now())