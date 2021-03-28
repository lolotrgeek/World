require('./src/functions')

const { World } = require('./src/world/world')

LOGGING = false

let energy = 1000
let odds = 0.005
let size = {x:500, y: 500}
let world = new World(energy, odds, size)
let agents = []

// log(world.ports)
world.spin()
