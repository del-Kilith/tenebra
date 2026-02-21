/**
 * Returns an array of size `n` filled with 0's ready to be mapped
 * @param n the size of the array
 * @param v default value of the elements of the array
 * @returns { [] }
 */
Array.ofSize = function(n, v = 0) {
  return new Array(n).fill(v)
}

Array.prototype.remove = function(item, equality = undefined) {
  const index = (() => {
    if (equality) {
      return this.findIndex(i => equality(i, item))
    } else {
      return this.indexOf(item)
    }
  })()
  return this.splice(index, 1)[0]
}

/**
 * Returns the first element of the array
 */
Object.defineProperty(Array.prototype, 'first', {
  get: function () {
    return this[0]
  }
})

/**
 * Returns the last element of the array
 */
Object.defineProperty(Array.prototype, 'last', {
  get: function () {
    return this[this.length - 1]
  }
})

/**
 *  Utilities for working with randomness
 */
const Random = {}

/**
 * Returns a random float in the provided range
 * @param max the maximum value, exclusive
 * @param min the minimum value, inclusive
 * @returns {number} a random float number
 */
Random.fltRange = function(max, min = 0) {
  return Math.random() * (max - min) + min
}

/**
 * Returns a random int in the provided range
 * @param max the maximum value, exclusive
 * @param min the minimum value, inclusive
 * @returns {number} a random int number
 */
Random.intRange = function(max, min = 0) {
  return Math.floor(Random.fltRange(max, min))
}

/**
 * Returns a random value from the passed array
 * @param { [] } options
 * @returns {*}
 */
Random.choice = function(options) {
  return options[Random.intRange(options.length)]
}

/**
 * Creates a weighted distribution, call next for a new value
 *
 * @param { [number, *][] } options an array of arrays containing
 *   the probability of the option and the option itself
 */
Random.distribution = function(options) {
  const pmf = options.map(option => option[0])
  const cdf = pmf.map((sum => value => sum += value)(0))

  const inx = r => cdf.findIndex(e => r <= e)
  const val = () => options[inx(Math.random())][1]

  console.assert(pmf.reduce((a, c) => a + c, 0) === 1, `Weighted distribution doesn't add to 1`)

  return { next: val, options }
}
