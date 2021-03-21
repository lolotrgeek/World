
// consumes a state and chooses an action from a given action space
// this is a hardcoded agent, will later be replaced with a neural network.

// TODO: connect to an environment, assume control of a spawned entity

const { register, listen } = require('./utilities/client')

class Agent {
  constructor(actions) {
    this.action_space = actions   
  }
  

  sample() {
    return randint(0, this.action_space)
  }


}

module.exports = { Agent }