// The manifestation of Energy
// Locality and Physicality
require('../../utils/functions')
const { Particle } = require('./Particle')


class OutputParticle extends Particle {
    constructor(charge, position) {
        super(charge, position)
        this.type = "output"
        this.size = 10
    }

    spin() {
        return
    }
}


module.exports = { OutputParticle }