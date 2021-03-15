// Evolution EcoSystem
// Daniel Shiffman <http://www.shiffman.net>
// The Nature of Code

// A World of creatures that eat food
// The more they eat, the longer they survive
// The longer they survive, the more likely they are to reproduce
// The bigger they are, the easier it is to land on food
// The bigger they are, the slower they are to find food
// When the creatures die, food is left behind


let myp5
let world

function createworld(msg) {
    world = new World(msg.world)
    startsketch(world)
}

function startsketch() {
  let sketch = function (p) {
    world.p = p
    p.setup = function () {
      cnv = p.createCanvas(world.size.x, world.size.y)
      cnv.style('display', 'block')
      // noLoop()
    }

    p.draw = function () {
      p.background(175)
      world.bloops.forEach(bloop => {
        bloop = world.manifest(bloop)
        let position = world.position(bloop)
        world.wraparound(position, bloop.radius)
        world.display(bloop)
      })
      // console.log(world.bloops)
      ws.send(JSON.stringify(world.bloops))
      // world.spin()
    }
  }

  myp5 = new p5(sketch)
}

listen(msg => {
  if (Array.isArray(msg)) world.bloops = msg
  else if (typeof msg === 'object' && typeof msg.world === 'object') createworld(msg)
})