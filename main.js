require('./src/functions') // modifying prototypes

const {World} = require('./src/world')

LOGGING = false

let energy = 1000
let world = new World(energy)
// log(world.ports)
world.populate()
world.spin()

