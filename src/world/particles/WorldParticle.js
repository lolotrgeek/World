// Place a World inside a Particle in order to Simulate environments
require('../../utils/functions')
const { Particle } = require('./Particle')
const { World } = require('../world')

class WorldParticle extends Particle {
    constructor(charge, position, energy) {
        super(charge, position)
        this.type = "world"
        this.size = { x: 10, y: 10 }
        this.energy = 10 // have to push particles from world...
    }
    // if it has input/output particles, then it has inputs and outputs
    // it needs a separate coordinate system.
    spin() {
        let world = new World(this.size, this.energy)
    }
}

module.exports = { WorldParticle }