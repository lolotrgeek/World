
// consumes a state and chooses an action from a given action space
// this is a hardcoded agent, will later be replaced with a neural network.

// TODO: connect to an environment, assume control of a spawned entity

const { RandomAgent } = require('./agents')

let amount = 5
let agents = []

function run() {
    while(amount > agents.length) {
        let agent = new RandomAgent()
        agents.push(agent)
    }
    agents.forEach(agent => {
        // TODO: multiprocess this...
        agent.reset()
        agent.spin()
    })
}
run()