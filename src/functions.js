
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
/**
 * 
 * Constrains a value between a minimum and maximum value.
 *
 * @method constrain
 * @param  {Number} n    number to constrain
 * @param  {Number} low  minimum limit
 * @param  {Number} high maximum limit
 * @return {Number}      constrained number
 */
let constrain = function(n, low, high) {
  return Math.max(Math.min(n, high), low);
};

/**
 * Re-maps a number from one range to another.
 * @param  {Number} n  the incoming value to be converted
 * @param  {Number} start1 lower bound of the value's current range
 * @param  {Number} stop1  upper bound of the value's current range
 * @param  {Number} start2 lower bound of the value's target range
 * @param  {Number} stop2  upper bound of the value's target range
 * @param  {Boolean} [withinBounds] constrain the value to the newly mapped range
 * @return {Number}        remapped number
 * @returns 
 */
Math.map = function(n, start1, stop1, start2, stop2, withinBounds) {
  const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  if (!withinBounds) {
    return newval;
  }
  if (start2 < stop2) {
    return constrain(newval, start2, stop2);
  } else {
    return constrain(newval, stop2, start2);
  }
};

global.random = function(min, max) {
  let rand= Math.random();
  if (typeof min === 'undefined') {
    return rand;
  } else if (typeof max === 'undefined') {
    if (min instanceof Array) {
      return min[Math.floor(rand * min.length)];
    } else {
      return rand * min;
    }
  } else {
    if (min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }

    return rand * (max - min) + min;
  }
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

global.isObject = function isObject(string) {
  try {
    return JSON.parse(string)
  } catch (error) {
    return false
  }
}

const PERLIN_YWRAPB = 4
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB
const PERLIN_ZWRAPB = 8
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB
const PERLIN_SIZE = 4095

let perlin_octaves = 4 // default to medium smooth
let perlin_amp_falloff = 0.5 // 50% reduction/octave

const scaled_cosine = i => 0.5 * (1.0 - Math.cos(i * Math.PI))

let perlin

/**
 * 
 * @method noise
 * @param  {Number} x   x-coordinate in noise space
 * @param  {Number} [y] y-coordinate in noise space
 * @param  {Number} [z] z-coordinate in noise space
 * @return {Number}     Perlin noise value (between 0 and 1) at specified
 *                      coordinates
 */
global.noise = function noise (x, y = 0, z = 0) {
  if (perlin == null) {
    perlin = new Array(PERLIN_SIZE + 1);
    for (let i = 0; i < PERLIN_SIZE + 1; i++) {
      perlin[i] = Math.random();
    }
  }

  if (x < 0) {
    x = -x;
  }
  if (y < 0) {
    y = -y;
  }
  if (z < 0) {
    z = -z;
  }

  let xi = Math.floor(x),
    yi = Math.floor(y),
    zi = Math.floor(z);
  let xf = x - xi;
  let yf = y - yi;
  let zf = z - zi;
  let rxf, ryf;

  let r = 0;
  let ampl = 0.5;

  let n1, n2, n3;

  for (let o = 0; o < perlin_octaves; o++) {
    let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);

    rxf = scaled_cosine(xf);
    ryf = scaled_cosine(yf);

    n1 = perlin[of & PERLIN_SIZE];
    n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
    n2 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
    n2 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
    n1 += ryf * (n2 - n1);

    of += PERLIN_ZWRAP;
    n2 = perlin[of & PERLIN_SIZE];
    n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
    n3 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
    n3 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
    n2 += ryf * (n3 - n2);

    n1 += scaled_cosine(zf) * (n2 - n1);

    r += n1 * ampl;
    ampl *= perlin_amp_falloff;
    xi <<= 1;
    xf *= 2;
    yi <<= 1;
    yf *= 2;
    zi <<= 1;
    zf *= 2;

    if (xf >= 1.0) {
      xi++;
      xf--;
    }
    if (yf >= 1.0) {
      yi++;
      yf--;
    }
    if (zf >= 1.0) {
      zi++;
      zf--;
    }
  }
  return r;
};