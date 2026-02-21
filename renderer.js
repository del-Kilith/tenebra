const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

const Renderer = {
  _references: [],
  _onCanvasResize: function () {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  },
  add: function(value, label, zIndex) {
    value.label = label
    value.zIndex = zIndex
    this._references.push(value)
    this._references.sort((a, b) => a.zIndex - b.zIndex)
  },
  sub: function(label) {
    this._references.remove(label, (a, b) => a.label === b)
  },
  render: function (alpha, measure = []) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    this._references.forEach(reference => {
      const shouldMeasure = measure.includes(reference.label)
      shouldMeasure && console.time(reference.label)
      context.save()
      reference.render(context, alpha)
      context.restore()
      shouldMeasure && console.timeEnd(reference.label)
    })
  }
}

Renderer._onCanvasResize()
window.addEventListener('resize', Renderer._onCanvasResize.bind(Renderer))