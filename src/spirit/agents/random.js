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
        // Check for a non-responsive server
        // TODO: parameterize death timeout, add retry?
        if(Date.now() - this.state.last_message > this.speed * 1000) {
            log(`${tag} lost message, dying.`)
            process.exit()// TODO: maybe initiate a retry sequence?
        }
        let msg
        if (this.state.creature) {
            msg = { action: this.sample(), agent: this.name, creature: this.state.creature.name }
        } else {
            msg = {name: this.name} // request a new creature
        }
        log(`${tag} Step: ${JSON.stringify(msg)}`)
        send(msg)
    }

    reset() {
        // clear values
        this.action = { choice: 0, params: [] }
        this.action_space = this.modules.map((module, slot) => [slot, module.params])
        this.observations = []
        // connect to world
        // TODO: handle disconnects, make this more robust
        register(this.name)
        // wait for a creature to spawn... listen for confirmation, then listen for observations
        listen(msg => {
            this.state.last_message = Date.now()
            // handle creature assignment
            // assignment : {creature: object, agent: string}
            if (msg.creature && this.name === msg.agent) {
                log(`${tag} Agent ${this.name} is assigned to Creature ${msg.creature.name}`)
                this.state.creature = msg.creature
            }
            if (msg.dead) {
                if (msg.dead.agent === this.name) {
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
            log(`${tag} State - ${this.name}: ${this.state.creature}`, 0)
            this.step()
        }, this.speed)
    }
}

module.exports = { Agent }
