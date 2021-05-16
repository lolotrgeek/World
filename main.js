require('./src/utils/functions')

const { World } = require('./src/world/world')
const { run } = require('./src/utils/server')
LOGGING = 'debug'


let energy = 4
let size = { x: 500, y: 500 }
let world = new World(energy, size)

run()
// log(world.ports)
world.spin()
