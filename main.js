require('./src/functions')

const { World } = require('./src/world/world')
const { run } = require('./server')
LOGGING = 'debug'


let energy = 10000
let odds = 0.005
let size = { x: 500, y: 500 }
let population = 100
let world = new World(energy, odds, size, population)

run()
// log(world.ports)
world.spin()
