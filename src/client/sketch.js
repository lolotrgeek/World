
  let div = document.getElementById("sketch")
  let x = div.offsetWidth
  let y = div.offsetHeight

function createworld(msg) {
  let world = new World(msg.particles, msg.size)
  return world
}

function scaleWorld(world) {
  world.x_scalar = x - world.size.x
  world.y_scalar = y - world.size.y
}

function startsketch(world) {
  let sketch = function (p) {
    world.p = p
    p.setup = function () {
      cnv = p.createCanvas(div.offsetWidth, div.offsetHeight)
      cnv.style('display', 'block')
      cnv.parent("sketch")
      // noLoop()
    }

    p.draw = function () {
      p.background(000)
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

