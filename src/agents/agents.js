
const { Agent } = require('./agent')

class Agents {
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

    create() {
        while (this.agents.length < this.amount) {
            let agent = new Agent(bloop.action_space)
            agent.address = "ws://localhost:" + this.port()
            this.agents.push(agent)
        }
    }


}

module.exports = { Agents }