// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Evolution EcoSystem

// Creature class
// Create a "bloop" creature
class Bloop {
  constructor(dna_, health) {
    this.address = null
    this.actions = []
    this.position = null // Location, gets from environment observations
    this.health = health // Life timer
    this.dna = dna_ // DNA
    this.attractions = [Math.random()] // trait(s) this agent is attracted to
    this.phenotype = { r: 0, g: 0, b: Math.round(this.attractions[0] * 100) }
    this.mate = null
    this.ate = null // index of food eaten
    this.observations = []
  }

  spin() {
    this.update()
  }

  // TODO: every bloop needs it's own process/address

  observe(bloops, foods) {
    this.observations.push({ bloops, foods })
    // TODO: send to Agent...
  }

  update() {
    if (this.observations.length > 0) {

      // let movement
      // this.position.add(movement)
    }
    this.observations = []
    // Death always looming
    this.health -= 0.2
  }

  reset() {
    this.ate = null
    this.mate = null
  }


  move(x, y) {
    this.position.x = this.position.x + x
    this.position.y = this.position.y + y
  }

  eat(food) {
    this.health += 100
    return food
  }

  select(nearby) {
    // select a mate by attractiveness
    let potentials = nearby.filter(bloop => {
      let attraction = Math.abs(this.attractions[0] - bloop.dna.genes[0])
      // ignore any others that are not attractive...
      let attracted = a => a > fuzz ? true : false
      if (attracted(attraction)) return true
      else return false
    })
    let selection
    // if there is more than one potential mate...reproduce with the most attractive one
    if (potentials.length > 1) selection = Array.max(potentials)
    // or just pick the only one... 
    else selection = potentials[0]
    return selection
  }

  give(nearby) {
    // give energy to nearby
  }

  reproduce(mate) {
    // local sexual reproduction
    let genes = this.dna.genes.concat(mate.dna.genes)
    let childDNA = this.dna.crossover(genes)
    return childDNA
  }

  a_reproduce() {
    // asexual reproduction
    if (random(1) < 0.0005) {
      let childDNA = this.dna.copy()
      return childDNA
    } else return null
  }
  dead() {
    if (this.health < 0.0) {
      return true
    } else {
      return false
    }
  }
}


module.exports = { Bloop }