const { register, listen, send } = require('./utilities/client')
const { v4: uuidv4 } = require('uuid')

const isObservation = data => Array.isArray(data)
const portGenerator = () => {
    let ports = []
    while (ports.length < 1000) {
        let port = randint(10000, 20000)
        if (ports.findint(port) === false) {
            ports.push(port)
        }
    }
    return ports
}

class Agent {
    constructor(dna_, energy) {
        // features
        this.dna = dna_
        this.energy = energy
        this.agents = []
        this.ports = portGenerator()
    }

    distribute(energy) {
        return randint(1, energy)
    }

    conserve(energy) {
        this.energy = this.energy - energy
    }

    port() {
        let choice = Array.choice(this.ports)
        this.ports.remove(choice)
        return choice
    }

    modulate(agent) {

    }

    spawn(energy) {
        while (this.agents.length < this.amount) {
            let agent = new Agent(actions)
            agent.address = "ws://localhost:" + this.port()
            this.agents.push(agent)
        }
    }
}

module.exports = { Agent }