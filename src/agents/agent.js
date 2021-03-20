
// consumes a state and chooses an action from a given action space
// this is a hardcoded agent, will later be replaced with a neural network.

// TODO: connect to an environment, assume control of a spawned entity

class Agent {
    constructor(actions) {
        this.action_space = actions 
    }

    sample() {
      let choice = 0
      if(random(0,2) > 1) {
        choice = Array.choice(action_space)
      }
      return choice
    }


}
