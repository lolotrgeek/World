require('./src/functions')

const { World } = require('./src/world/world')
const { run } = require('./src/utils/server')
LOGGING = 'debug'


let energy = 1000
let odds = 0.005
let size = { x: 500, y: 500 }
let world = new World(energy, odds, size)

run()
// log(world.ports)
world.spin()
