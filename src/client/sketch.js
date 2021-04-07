// Evolution EcoSystem
// Daniel Shiffman <http://www.shiffman.net>
// The Nature of Code

// A World of creatures that eat food
// The more they eat, the longer they survive
// The longer they survive, the more likely they are to reproduce
// The bigger they are, the easier it is to land on food
// The bigger they are, the slower they are to find food
// When the creatures die, food is left behind


function createworld(msg) {
    let world = new World(msg.bloops, msg.energy)
    return world
}

function startsketch(world) {
  let sketch = function (p) {
    world.p = p
    p.setup = function () {
      let div = document.getElementById("sketch")
      // cnv = p.createCanvas(world.size.x, world.size.y)
      cnv = p.createCanvas(div.offsetWidth, div.offsetHeight)
      cnv.style('display', 'block')
      cnv.parent("sketch")
      // noLoop()
    }

    p.draw = function () {
      p.background(175)
      world.spin()
      // console.log(world.bloops)
      // ws.send(JSON.stringify(world.bloops))
      // world.spin()
    }
  }

  let myp5 = new p5(sketch)
}
function stopsketch(world) {
  console.log('stopping')
  world.p.remove()
}

