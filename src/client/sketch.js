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

let bloops = [
  // {
  //   actions: [],
  //   address: "ws://localhost:11454",
  //   ate: null,
  //   attractions: [0.7151522921248135],
  //   dna: { genes: Array(1) },
  //   health: 729.5999999999954,
  //   mate: null,
  //   maxspeed: 10.649959319422692,
  //   observation_limit: 43.500406805773075,
  //   observations: [],
  //   phenotype: { r: 0, g: 0, b: 72 },
  //   position: { x: 389.2113463977599, y: 993.2798060964471 },
  //   radius: 14.500135601924358,
  // },

  // {
  //   actions: [],
  //   address: "ws://localhost:19966",
  //   ate: null,
  //   attractions: [0.06017470390205415],
  //   dna: { genes: Array(1) },
  //   health: 7.600000000000071,
  //   mate: null,
  //   maxspeed: 13.846535572622418,
  //   observation_limit: 11.534644273775818,
  //   observations: [],
  //   phenotype: { r: 0, g: 0, b: 6 },
  //   position: { x: 530.199930697919, y: 746.1943008711423, },
  //   radius: 3.8448814245919394,
  // },

  // {
  //   actions: [],
  //   address: "ws://localhost:11987",
  //   ate: null,
  //   attractions: [0.4143342623102677],
  //   dna: { genes: Array(1) },
  //   health: 199.60000000000116,
  //   mate: null,
  //   maxspeed: 13.032597828108393,
  //   observation_limit: 19.67402171891606,
  //   observations: [],
  //   phenotype: { r: 0, g: 0, b: 41 },
  //   position: { x: 865.1051669953248, y: 1073.528855360746, },
  //   radius: 6.558007239638686
  // },
]

function setup() {
  cnv = createCanvas(windowWidth, windowHeight)
  cnv.style('display', 'block')
  textSize(20)
  noLoop()
  // World starts with 20 creatures
  // and 20 pieces of food
  world = new World()
}

function draw() {
  background(175)
  // text(`Message: ${msg.toString()}` , 10, 30)
  if (bloops.length > 0) world.bloops = bloops
  else if (Array.isArray(msg)) world.bloops = msg

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

// We can add a creature manually if we so desire
// function mousePressed() {
//   world.spawn(mouseX, mouseY)
// }

// function mouseDragged() {
//   world.spawn(mouseX, mouseY)
// }