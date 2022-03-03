require('./src/utils/functions')

const { World } = require('./src/world/world')
const { Mind } = require('./src/world/mind')
const { run } = require('./src/utils/server')
LOGGING = 'debug'


let energy = 1500
let size = {
    world: { x: 1000, y: 1000 },
    mind: { x: 200, y: 200 }
}
let speed = 50
let mind = new Mind(size.mind)
let world = new World(size.world, energy, mind, speed)


run()
mind.reset()
world.reset()
world.populate()
world.spin()
