
/**
 * forEach in reverse to walk backward through an array
 */
Object.defineProperty(Array.prototype, 'forEachRev', {
  value: function (callback) {
    for (let i = this.length - 1; i >= 0; i--) {
      element = this[i]
      callback(element, i)
    }
  }
})

Array.max = function (array) {
  return Math.max.apply(Math, array)
};

function randint(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

module.exports = {
  randint :randint
}