
// consumes a state and chooses an action from a given action space
// this is a hardcoded agent, will later be replaced with a neural network.

// TODO: connect to an environment, assume control of a spawned entity

const { RandomAgent } = require('./agents')

let agent = new RandomAgent()

agent.reset()
agent.spin()