require('./src/utils/functions')

const { World } = require('./src/world/world')
const { run } = require('./src/utils/server')
LOGGING = 'debug'


let energy = 100
let size = { x: 500, y: 500 }
let world = new World(size, energy)

run()
// log(world.ports)
world.spin()
