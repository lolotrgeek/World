const { register, listen, send } = require('./utilities/client')
const { v4: uuidv4 } = require('uuid')
const isObservation = data => Array.isArray(data)

class RandomAgent {
    constructor() {
        this.name = uuidv4()
        this.creature = null
    }

    sample() {
        let choice = randint(0, this.creature.action_space.length)
        let params = this.parameterize(this.creature.action_space[choice][1])
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

    spin() {
        let step = { action: this.sample(), actor: this.name, creature: this.creature.name }
        // log(step)
        send(step)
    }

    reset() {
        listen(msg => {
            if (msg.creature && msg.actor === this.name) {
                log(`Agent ${this.name} is assigned to Creature ${msg.creature.name}`)
                this.creature = msg.creature
            }
            if (isObservation(msg)) {
                if (this.creature && !msg.find(creature => creature.name === this.creature.name)) {
                    log('Creature Died: ' + this.creature)
                    this.creature = null
                }
            }
        })
        register({ agent: this })
    }
}

module.exports = { RandomAgent }
