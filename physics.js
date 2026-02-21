const Physics = {
  _references: [],
  add: function (value, label) {
    value.label = label
    this._references.push(value)
  },
  sub: function (label) {
    this._references.remove(label, (a, b) => a.label === b)
  },
  update: function (dt) {
    this._references.forEach(value => value.update(dt))
  }
}
