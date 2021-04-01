require('../functions')
// consumes a state and chooses an action from a given action space
// this is a hardcoded agent, will later be replaced with a neural network.

// TODO: connect to an environment, assume control of a spawned entity

const {AgentLand} = require('./umbra')

LOGGING = false

let energy = 1000
let heaven = new AgentLand(energy)

heaven.spin()