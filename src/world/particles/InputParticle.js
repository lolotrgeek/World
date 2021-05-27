// The manifestation of Energy
// Locality and Physicality
require('../../utils/functions')
const { Particle } = require('./Particle')


class InputParticle extends Particle {
    constructor(charge, position) {
        super(charge, position)
        this.type = "input"
        this.size = 10
    }

    spin() {
        return
    }
}


module.exports = { InputParticle }