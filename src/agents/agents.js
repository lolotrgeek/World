const { register, listen, send } = require('./utilities/client')
const { v4: uuidv4 } = require('uuid')

const isObservation = data => Array.isArray(data)

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
        this.creature = null
    }

    sample() {
        return randint(0, this.action_space)
    }

    spin() {
        send({ action: this.sample(), actor: this.name, creature: this.creature })
    }

    reset() {
        listen(msg => {
            if (msg.creature && msg.actor === this.name) {
                log(`Agent ${this.name} is assigned to Creature ${msg.creature.name}`)
                this.creature = msg.creature.name
                this.action_space = msg.creature.action_space
            }
            if (isObservation(msg)) {
                if (this.creature && !msg.find(creature => creature.name === this.creature)) {
                    log('Creature Died: ' + this.creature)
                    this.creature = null
                }

            }
        })
        register({ agent: this })
    }

}

module.exports = { Agent, RandomAgent }
