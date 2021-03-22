const { register, listen } = require('./utilities/client')
const { v4: uuidv4 } = require('uuid')

class Agent {
    constructor(amount) {
        this.amount = amount
        this.agents = []
        this.ports = []
        // generate unique ports
        while (this.ports.length < 1000) {
            let port = randint(10000, 20000)
            if (this.ports.findint(port) === false) {
                this.ports.push(port)
            }
        }
    }

    port() {
        let choice = Array.choice(this.ports)
        this.ports.remove(choice)
        return choice
    }

    create(actions) {
        while (this.agents.length < this.amount) {
            let agent = new Agent(actions)
            agent.address = "ws://localhost:" + this.port()
            this.agents.push(agent)
        }
    }


}

class RandomAgent {
    constructor() {
        this.name = uuidv4()
        this.action_space = 0
    }

    sample() {
        return randint(0, this.action_space)
    }

    spin() {
        listen(msg => {
            if(typeof msg === 'object') {
                // console.log(Object.keys(msg))
            }
            if (msg.creature) {
                this.action_space = msg.creature.action_space
                console.log(msg.creature.action_space) // need to set this
            }
        })
    }

    reset() {
        register({ agent: this })
    }

}

module.exports = { Agent, RandomAgent }
