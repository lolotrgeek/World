require('./src/utils/functions')

const { World } = require('./src/world/world')
const { Mind } = require('./src/world/mind')
const { run } = require('./src/utils/server')
LOGGING = 'debug'


let energy = 500
let size = {
    world: { x: 1000, y: 1000 },
    mind: { x: 200, y: 200 }
}
let mind = new Mind(size.mind)
let world = new World(size.world, energy, mind)


run()

world.reset()
world.populate()
world.spin()
