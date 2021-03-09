// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Evolution EcoSystem

// Creature class
// Create a "bloop" creature
class Bloop {
  constructor(l, dna_) {
    this.actions = new Actions(this)
    this.position = l.copy() // Location
    this.health = 200 // Life timer
    this.xoff = random(1000)
    this.yoff = random(1000)
    this.dna = dna_ // DNA
    this.maxspeed = map(this.dna.genes[0], 0, 1, 15, 0) // The bigger the bloop, the slower it is
    this.radius = map(this.dna.genes[0], 0, 1, 0, 50)
    this.observation_limit = this.radius * 3
    this.skin = this.radius / 2
    this.attractions = [random(0, 1)] // trait(s) this agent is attracted to
    this.mate = null
    this.ate = null // index of food eaten
    this.observations = []
  }

  spin() {
    this.update()
  }

  inside(thingLocation) {
    let distance = p5.Vector.dist(this.position, thingLocation)
    if (distance < this.skin) return true
    else return false
  }

  observe(bloops, foods) {
    this.observations.push({ bloops, foods })
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

  phenotype() {
    let r = 0
    let g = 0
    let b = Math.round(this.attractions[0] * 100)
    return { r, g, b }
  }

  dead() {
    if (this.health < 0.0) {
      return true
    } else {
      return false
    }
  }
}

class Actions {
  constructor(creature) {
    this.creature = creature 
  }

  move(x, y) {
    this.creature.position.x = this.creature.position.x + x
    this.creature.position.y = this.creature.position.y + y
  }

  eat(food) {
    this.creature.health += 100
    return food
  }

  select(nearby) {
    // select a mate by attractiveness
    let potentials = nearby.filter(bloop => {
      let attraction = Math.abs(this.creature.attractions[0] - bloop.dna.genes[0])
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
    let genes = this.creature.dna.genes.concat(mate.dna.genes)
    let childDNA = this.creature.dna.crossover(genes)
    // console.log('Reproducing!', childDNA)
    return childDNA
  }

  a_reproduce() {
    // asexual reproduction
    if (random(1) < 0.0005) {
      // Child is exact copy of single parent
      let childDNA = this.creature.dna.copy()
      // Child DNA can mutate
      return childDNA
    } else return null
  }
}