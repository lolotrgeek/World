
const fs = require('fs')

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

/**
 * find the first occurance of int in array
 */
 Object.defineProperty(Array.prototype, 'findint', {
  value: function (value) {
    let found = false
    for (let i = 0; i < this.length; i++) {
      element = this[i]
      if(element === value) {
        found = element
        break
      }
    }
    return found
  }
})

/**
 * Remove element(s) from array
 * @returns array
 */
Array.prototype.remove = function() {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
      what = a[--L]
      while ((ax = this.indexOf(what)) !== -1) {
          this.splice(ax, 1)
      }
  }
  return this
}

Array.choice = function (array) {
  return array[Math.floor(Math.random() * array.length)]
}

Array.max = function (array) {
  return Math.max.apply(Math, array)
};

global.randint = function randint(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

global.log = function log(msg) {
  if (LOGGING === true) {
    let entry = '\n' + `[${new Date().toLocaleString()}] - ${msg}`
    fs.appendFile('./logs/serverlog.txt', entry, (err) => {
      if (err) console.log(err);
    });
  } else {
    console.log(msg)
  }
}
