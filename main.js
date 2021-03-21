require('./src/functions')

const { World } = require('./src/world/world')
const { Agent } = require('./src/agents/agent')

LOGGING = false

let energy = 1000
let odds = 0.005
let world = new World(energy, odds)
let agents = []

// log(world.ports)
world.populate()
world.spin()
