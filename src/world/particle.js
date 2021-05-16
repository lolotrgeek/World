// The manifestation of Energy
// Locality and Physicality
require('../utils/functions')
class Particle {
    constructor() {
        this.charge = Array.choice([-1, 0, 1]) // randomly assign polarity -1 negative, 0 neutral, 1 positive
        // TODO: add polarized particles? (both positive and negative) 
        this.position = { x: 0, y: 0 }
        this.size = 1 // radius of the particle
        this.aura = 5 // radius of the particle's charge
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
                neighbors[i].attraction = neighbor.distance
            } else {
                neighbors[i].attraction = neighbor.distance * -1
            }
        })
    }

    moveTowards(other, velocity) {
        let dX = other.position.x - this.position.x
        let dY = other.position.y - this.position.y

        this.position.x += (dX / velocity)
        this.position.y += (dY / velocity)
    }

    moveAwayFrom(other, velocity) {
        let dX = other.position.x - this.position.x
        let dY = other.position.y - this.position.y

        this.position.x -= (dX / velocity)
        this.position.y -= (dY / velocity)
    }

    spin() {
        this.getAttractions()
        this.neighbors.forEach((neighbor, i) => {
            if (neighbor.attraction < 0) {
                this.moveAwayFrom(neighbor, neighbor.distance)
            }
            if (neighbor.attraction > 0) {
                this.moveTowards(neighbor, neighbor.distance)
            }
        })
    }
}

module.exports = { Particle }