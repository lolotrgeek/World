const { register, listen, send } = require('../client/client')
const isObservation = data => Array.isArray(data)

const tag = "[Agent]"

class Agent {
    constructor(dna_) {
        //features
        this.dna = dna_
        this.name = null

        // spaces
        this.action_space = []

        // modules
        this.slots = 4
        this.modules = []

        // state
        this.observations = []
        this.action = { choice: 0, params: [] }
        this.state = {}
    }

    sample() {
        //TODO: sample internal action space 
        let choice = randint(0, this.state.creature.action_space.length)
        let params = this.parameterize(this.state.creature.action_space[choice][1])
        return { choice, params }
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
        let msg
        if (this.state.creature) {
            msg = { action: this.sample(), agent: this.name, creature: this.state.creature.name }
        } else {
            msg = {name: this.name} // request a new creature
        }
        send(msg)
    }

    reset() {
        // clear values
        this.action = { choice: 0, params: [] }
        this.action_space = this.modules.map((module, slot) => [slot, module.params])
        this.observations = []
        // connect to world
        register(this.name)
        // wait for a creature to spawn... listen for confirmation, then listen for observations
        listen(msg => {
            if (msg.creature && this.name === msg.creature.agent) {
                log(`${tag} Agent ${this.name} is assigned to Creature ${msg.creature.name}`)
                this.state.creature = msg.creature
            }
            if (isObservation(msg)) {
                if (this.state.creature && !msg.find(creature => creature.name === this.state.creature.name)) {
                    log(`${tag} Creature Died:  ${this.state.creature}`)
                    this.state.creature = null
                }
            }
            //TODO: handle waiting in queue? other than resending name?
        })
    }

    spin() {
        this.reset()
        setInterval(() => {
            // TODO: reset action space by mapping modules
            this.step()
            this.state.rotations++
        }, 100)
    }
}

module.exports = { Agent }
