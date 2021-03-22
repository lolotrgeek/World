require('./src/functions')

const { World } = require('./src/world/world')

LOGGING = false

let energy = 1000
let odds = 0.005
let world = new World(energy, odds)
let agents = []

// log(world.ports)
world.spin()
