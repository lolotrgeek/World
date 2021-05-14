// The manifestation of Energy
// Locality and Physicality
require('./utils/functions')
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

    spin() {
        let attractions = []
        this.neighbors.forEach(neighbor => {
            if (this.isAttracted(neighbor.charge)) {
                attractions.push(neighbor)
            }
        })
        let top = [] // list of indices that point to top attractions
        let max = 0
        attractions.forEach((attraction, i) => {
            let current = attractions[i].distance
            if (current > max) {
                // set new max
                max = current
                // put attraction index in top
                top.push(i)
                // remove any top index values that point to attractions less than max
                top.forEach((value, index) => {
                    if (attractions[value].distance < max) {
                        top.slice(index)
                    }
                })
            }
            else if (current === max) {
                // put another attraction index in top
                top.push(i)
            }
        })
        if(top.length === 1) {
            let attraction = attractions[top[0]] 
            // if there is a single top attraction, move towards it
            if (attraction.distance > this.position) {

                let dX = attraction.position.x - this.position.x
                let dY = attraction.position.y - this.position.y
    
                this.position.x += (dX / 10)
                this.position.y += (dY / 10)
    
            }            
        } else if (top.length > 1) {
            top.forEach(index => {
                // TODO: if there are multiple top attractions find and move to a space between them.
                
            })
        }


    }
}