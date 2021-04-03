// Creature class
// Create a "bloop" creature
// NOTE: a creature is an environment

const tag = "[Bloop]"

class Bloop {
  constructor(dna_, health) {
    // features
    this.name = null
    this.health = health
    this.dna = dna_
    this.attractions = [Math.random()]
    this.phenotype = { r: 0, g: 0, b: Math.round(this.attractions[0] * 100) }

    // spaces
    // generated by the attached modules
    this.action_space = []

    // modules
    this.slots = 4
    this.modules = []

    // state
    this.observations = []
    this.action = {choice: 0, params: []}
    this.state = {}
  }

  spin(observations, cost) {
    this.observations = observations
    let module = this.modules[this.action.choice]
    let result = module.spin(this)
    // update state : add key/value of result to state object
    let newstate = Object.keys(result)
    if (newstate.length > 0) newstate.forEach(key => this.state[key] = result[key])
    this.health -= cost
    log(`${tag} ${this.name} - action: [${module.constructor.name}, ${JSON.stringify(this.action)}], cost:${cost}, health:${this.health}`)
  }

  reset() {
    // this.action = {choice: 0, params: []} // retain last action in order to determine if agent is still sending new actions
    this.action_space = this.modules.map((module, slot) => [slot, module.params])
    this.observations = []
  }

}

module.exports = { Bloop }