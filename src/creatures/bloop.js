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

    // spaces
    this.actions = new Actions()
    this.observations = []

    // action
    this.action = null // mate, ate, ping, etc...
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
    this.action = null
  }

}


module.exports = { Bloop }