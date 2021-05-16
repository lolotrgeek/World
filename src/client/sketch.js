
function createworld(msg) {
    let world = new World(msg.particles, msg.size)
    return world
}

function startsketch(world) {
  let sketch = function (p) {
    world.p = p
    p.setup = function () {
      let div = document.getElementById("sketch")
      cnv = p.createCanvas(world.size.x, world.size.y)
      // cnv = p.createCanvas(div.offsetWidth, div.offsetHeight)
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

