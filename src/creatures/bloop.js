// Creature class
// Create a "bloop" creature
// NOTE: a creature is an environment
const { Actions } = require('./actions')

class Bloop {
  constructor(dna_, health) {
    // features
    this.health = health
    this.dna = dna_
    this.attractions = [Math.random()]
    this.phenotype = { r: 0, g: 0, b: Math.round(this.attractions[0] * 100) }
    this.address = null

    // observations
    this.position = null
    this.mate = null
    this.ate = null

    // spaces
    this.actions = new Actions()
    this.observations = []
  }

  spin() {
    if (this.observations.length > 0) {
      //NOTE: observation space = network ping distance 
    }
    this.observations = []
    this.health -= 0.2
  }

  observe(bloops, foods) {
    this.observations.push({ bloops, foods })
  }

  reset() {
    this.ate = null
    this.mate = null
  }

  dead() {
    if (this.health < 0.0) return true
    else return false
  }
}


module.exports = { Bloop }