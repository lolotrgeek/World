// Evolution EcoSystem
// Daniel Shiffman <http://www.shiffman.net>
// The Nature of Code

// A World of creatures that eat food
// The more they eat, the longer they survive
// The longer they survive, the more likely they are to reproduce
// The bigger they are, the easier it is to land on food
// The bigger they are, the slower they are to find food
// When the creatures die, food is left behind

let world

function setup() {
  cnv = createCanvas(windowWidth, windowHeight)
  cnv.style('display', 'block')
  textSize(20)
  // World starts with 20 creatures
  // and 20 pieces of food
  world = new World()
}

function draw() {
  background(175)
  // text(`Message: ${msg.toString()}` , 10, 30)
  if (Array.isArray(msg)) {
    world.bloops = msg
    world.bloops.forEach(bloop => bloop = world.visualize(bloop))
  }
  world.spin()
}

// We can add a creature manually if we so desire
// function mousePressed() {
//   world.spawn(mouseX, mouseY)
// }

// function mouseDragged() {
//   world.spawn(mouseX, mouseY)
// }