// Creature class
// Create a "bloop" creature
// NOTE: a creature is an environment


class Bloop {
  constructor(dna_, health) {
    // features
    this.health = health
    this.dna = dna_
    this.attractions = [Math.random()]
    this.phenotype = { r: 0, g: 0, b: Math.round(this.attractions[0] * 100) }
    this.address = null

    // spaces
    // generated by the attached modules
    this.action_space = 0
    this.observation_space = 0

    // modules
    this.slots = 3
    this.modules = []

    // state
    this.action = 0
    this.observation = []
  }

  spin(action) {
    this.act(action)
    this.observation = []
  }

  translate(action) {
    // shift actions to align with modules
    return action - 1
  }

  act(action) {
    if (action && action !== 0) {
      this.action = this.modules[this.translate(action)].spin(this)
    }
  }

  reset() {
    this.action = 0
    this.action_space = this.modules.length + 1
  }

}

module.exports = { Bloop }