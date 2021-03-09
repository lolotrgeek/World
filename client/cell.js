// Evolution EcoSystem

// Creature class

// Create a "cell" creature
class Cell {
  constructor(l, dna_) {
    this.position = l.copy() // Location
    this.health = 200 // Life timer
    this.dna = dna_ // DNA
    this.maxspeed = map(this.dna.genes[0], 0, 1, 15, 0)
    this.radius = map(this.dna.genes[0], 0, 1, 0, 50)
    this.skin = this.radius / 2
  }

  spin() {
    this.update()
  }

  brain(observation) {
    let action
    return action
  }

  move(x, y) {
    this.position.x = position.x + x
    this.position.y = position.y + y
  }

  reproduce() {
    // asexual reproduction
    if (random(1) < 0.0005) {
      // Child is exact copy of single parent
      let childDNA = this.dna.copy()
      // Child DNA can mutate
      childDNA.mutate(0.01)
      return new Bloop(this.position, childDNA)
    } else {
      return null
    }
  }

  update() {
    let movement = this.brain()
    this.position.add(movement)
    // Death always looming
    this.health -= 0.2
  }

  phenotype() {
    let r = Math.round(this.attractions[0] * 100)
    let g = 0
    let b = 0
    return { r, g, b }
  }

  // Method to display

  // Death
  dead() {
    if (this.health < 0.0) {
      return true
    } else {
      return false
    }
  }
}