const _debug = document.querySelector('#debug')
const _fps = _debug.querySelector('#fps')
const _sampleRate = _debug.querySelector('#sample-rate')
const _frameSpikes = _debug.querySelector('#frame-spikes')
const _fallingStars = _debug.querySelector('#falling-stars')
const _simulationTime = _debug.querySelector('#simulation-time')
const _loadedImages = _debug.querySelector('#loaded-images')
const _wakeLock = _debug.querySelector('#wake-lock')

const Debug = {
  setSampleRate: function(sample) {
    _sampleRate.innerText = `Sampling every: ${sample} frames`
  },
  setFPS: function(fps) {
    _fps.innerText = `${fps.toFixed(2)} FPS`
  },
  setFrameSpikes: function(frameSpikes) {
    _frameSpikes.innerText = `Frame rate spikes: ${frameSpikes}`
  },
  setFallingStars: function(count) {
    _fallingStars.innerText = `Falling stars count: ${count}`
  },
  setSimulationTime: function(time) {
    _simulationTime.innerText = `Simulation time: ${(time / 1000).toFixed(2)}s`
  },
  setLoadedImages: function(images) {
    _loadedImages.innerText = `Loaded images: ${images}`
  },
  setWakeLock: function(success) {
    _wakeLock.innerText = `Wake lock: ${success}`
  }
}
