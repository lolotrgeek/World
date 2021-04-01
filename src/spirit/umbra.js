// A Proxy for the Spirit world 
// ("agent land")

// spawning agents and tracking used ports

const { Agent } = require('./agents/random')
const { DNA } = require('./agents/dna')

const { v4: uuidv4 } = require('uuid')
const { register, listen, send } = require('./client/client')

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

class AgentLand {

    constructor(energy) {
        // features
        this.energy = energy
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

    manifest(agent) {
        // set initial state of agent
        if(!agent.state.address) agent.state.address = "ws://localhost:" + this.port()
        if(!agent.state.world) agent.state.world = "ws://localhost:8888" 
        if(!agent.state.rotations) agent.state.rotations = 0 
        return agent
    }

    modulate(agent) {
        // TODO: add local modules and creature modules to action space
    }

    spawn(energy) {
        while (this.agents.length < this.amount) {
            let dna = new DNA()
            agent = this.manifest(this.modulate(new Agent(dna, energy)))
            agent.name = uuidv4()
            agent.reset()
            //TODO: spawn a sub-process for agent
        }
    }

    parameterize(amount) {
        let params = []
        // fill each parameter with a random integer 
        while (amount > params.length) {
            params.push(randint(-2, 2))
        }
        return params
    }

    step() {
        
    }

    reset() {
        register('Umbra')
    }

    spin() {
        listen(msg => {
            //TODO: listen for spawn requests
        })
        this.reset()
    }


}

module.exports = { AgentLand }