// A Proxy for the Spirit world 
// ("agent land")

// spawning agents and tracking used ports
const { fork } = require('child_process')
const { register, listen, send } = require('./client/client')

const tag = "[Umbra]"

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
    constructor() {
        this.ports = portGenerator()
        this.children = []
    }

    port() {
        let choice = Array.choice(this.ports)
        this.ports.remove(choice)
        return choice
    }

    populate(amount) {
        while (this.children.length < amount) {
            const child = fork('run.js', [this.port()])
            this.children.push(child)
            log(`${tag} Spawning Child - PID: ${child.pid}`)
        }
    }
    step() {

    }

    reset() {
        register('Umbra')
    }

    spin() {
        this.reset()
    }


}

module.exports = { AgentLand }