const { register, listen, send } = require('../client/client')
const isObservation = data => Array.isArray(data)

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
        this.action = {choice: 0, params: []}
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
        return { action: this.sample(), actor: this.name, creature: this.state.creature.name }
    }

    reset() {
        this.action = {choice: 0, params: []}
        this.action_space = this.modules.map((module, slot) => [slot, module.params])
        this.observations = []
        register(this.name)

        listen(msg => {
            if (msg.creature && this.name === msg.creature.agent) {
                log(`Agent ${this.name} is assigned to Creature ${msg.creature.name}`)
                this.state.creature = msg.creature
            }
            if (isObservation(msg)) {
                if (this.state.creature && !msg.find(creature => creature.name === this.state.creature.name)) {
                    log('Creature Died: ' + this.state.creature)
                    this.state.creature = null
                }
            }
        }) 
    }

    spin() {
       this.reset()
        setInterval(() => {
            // TODO: reset action space by mapping modules
            let step = this.step()
            // log(step)
            send(step)
            this.state.rotations++
        }, 100)
    }    
}

module.exports = { Agent }
