// The manifestation of Energy
// Locality and Physicality
require('../utils/functions')
class Particle {
    constructor(charge, position) {
        this.charge = charge
        // TODO: add polarized particles? (both positive and negative) 
        this.position = position
        this.size = 3 // radius of the particle
        this.aura = 50 // radius of the particle's charge
        this.neighbors = []
    }

    isAttracted(charge) {
        if (charge === -1 && this.charge === 1) {
            return true
        }
        else if (charge === 1 && this.charge === -1) {
            return true
        }
        else return false
    }

    getAttractions() {
        this.neighbors.forEach((neighbor, i) => {
            if (this.isAttracted(neighbor.charge)) {
                this.neighbors[i].attraction = neighbor.distance
            } else {
                //NOTE: neutral particles are pushed away from both positive and negative particles...
                this.neighbors[i].attraction = neighbor.distance * -1
            }
        })
    }

    sizeCoordinate(coordinate, size) {
        return (Math.abs(coordinate) + size) * Math.sign(coordinate)
    }

    sizePosition() {
        let sized_position = {}
        sized_position.x = this.sizeCoordinate(this.position.x, this.size)
        sized_position.y = this.sizeCoordinate(this.position.y, this.size)
        this.position = sized_position
    }

    moveTowards(other, velocity) {
        let dY = other.position.y - this.position.y
        let dX = other.position.x - this.position.x

        this.position.x += (dX / velocity)
        this.position.y += (dY / velocity)
    }

    moveAwayFrom(other, velocity) {
        let dY = other.position.y - this.position.y
        let dX = other.position.x - this.position.x

        this.position.x -= (dX / velocity)
        this.position.y -= (dY / velocity)
    }

    noMove(){
        this.position.x = this.position.x
        this.position.y = this.position.y
    }

    spin() {
        // this.sizePosition()
        this.getAttractions()
        this.neighbors.forEach((neighbor, i) => {
            if (neighbor.attraction < 0) {
                this.moveAwayFrom(neighbor, neighbor.distance)
            }
            if (neighbor.attraction > 0) {
                if (neighbor.distance < this.size + neighbor.size) {
                    this.noMove()
                } else {
                    this.moveTowards(neighbor, neighbor.distance)

                }
            }
        })
    }
}

class InputParticle extends Particle {
    constructor(charge, position) {
        super(charge, position)
        this.type ="input"
        this.size = 10
    }

    spin() {
        return 
    }
}

class OutputParticle extends Particle {
    constructor(charge, position) {
        super(charge, position)
        this.type ="output"
        this.size = 10
    }

    spin() {
        return
    }
}


module.exports = { Particle, InputParticle, OutputParticle }