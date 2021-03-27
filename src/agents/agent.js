require('../functions')
// consumes a state and chooses an action from a given action space
// this is a hardcoded agent, will later be replaced with a neural network.

// TODO: connect to an environment, assume control of a spawned entity

const { RandomAgent } = require('./agents')

LOGGING = false

let amount = 10
let agents = []
let rotations = 0

function run() {
    while (amount > agents.length) {
        let agent = new RandomAgent()
        agents.push(agent)
    }

    // TODO: multiprocess this...
    agents.forEach(agent => agent.reset())
    setInterval(() => {
        agents.forEach((agent, i) => {
            if (agent.creature !== null) agent.spin()
            else if(rotations > 1) {
                log(`Stopping Agent ${agent.name}`)
                agents.splice(i, 1)
            }
        })
        rotations++
    }, 500)

}
run()

