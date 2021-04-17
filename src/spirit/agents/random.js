// Maximize - have more energy than last step.

const { register, listen, send } = require('../client/client')

const tag = "[Agent]"

class Agent {
    constructor(dna_) {
        //features
        this.dna = dna_
        this.name = null
        this.speed = 100

        // spaces
        this.action_space = []

        // modules
        this.slots = 4
        this.modules = []

        // state
        this.observations = []
        this.actions = []
        this.assigned = []
        this.action = { choice: 0, params: [], last_action: Date.now()}
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
        // fill each action parameter with a random integer 
        while (amount > params.length) {
            params.push(randint(-2, 2))
        }
        return params
    }

    step() {
        let msg
        if(this.observations.length > 0) {
            log(`${tag} Observation Step: ${JSON.stringify(this.observations)}`) 
            log(`${tag} Observation Step: Nearby ${JSON.stringify(this.observations[0].nearby)}`) 
        }
        if (this.state.creature) {
            msg = { action: this.sample(), agent: this.name, creature: this.state.creature.features.name }
            this.actions.push(msg)
            log(`${tag} Action Step: ${JSON.stringify(msg)}`, {show: false})
        } else {
            msg = {name: this.name, time: Date.now()} // request a new creature
            log(`${tag} Request Step: ${JSON.stringify(msg)}`, {show: false})
        }
        send(msg)
        this.observations = [] // only remember last observation  
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
            this.state.last_message = Date.now()
            if(!msg) {
                log(`${tag} Unknown Message ${msg}`)
            }
            // handle creature assignment
            // assignment : {creature: object, agent: string}
            else if (msg.creature && this.name === msg.agent) {
                log(`${tag} Agent ${this.name} is assigned to Creature ${msg.creature.features.name}`, {show: false})
                this.state.creature = msg.creature
            }
            else if (this.state.creature) {
                if(msg.dying) {
                    if (msg.dying.agent === this.name && this.state.creature.features.name == msg.dying.features.name) {
                        log(`${tag} Creature Dying:  ${this.state.creature.features.name}, Received: ${msg.dying.actions.length} Sent: ${this.actions.length} Assigned: ${this.assigned.length}`, {show: false})
                        // ping back sampled action to avoid dead
                        msg = { action: this.sample(), agent: this.name, creature: this.state.creature.features.name }
                        send(msg)
                    }
                }
                if (msg.dead) {
                    if (msg.dead.agent === this.name) {
                        log(`${tag} Creature Died:  ${this.state.creature.features.name}`, {show: false})
                        this.state.creature = null
                    }
                }
                if(msg.state) {
                    if(typeof msg.state === 'object') {
                        log(`${tag} Creature Observations, ${JSON.stringify(msg.state)}`, {show: false})
                        this.observations.push(msg.state)
                    }
                }
                if(msg.assigned) {
                    log(`${tag} Action Assigned:  ${msg.assigned}`, {show: false})
                    this.assigned.push(msg.assigned)
                }
            }
        })
    }

    spin() {
        this.reset()
        setInterval(() => {
            // TODO: reset action space by mapping modules
            log(`${tag} State - ${this.name}: ${this.state.creature}`, {show: false})
            this.step()
        }, this.speed)
    }
}

module.exports = { Agent }
