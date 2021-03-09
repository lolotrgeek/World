// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Evolution EcoSystem

class World {
  constructor(energy) {
    this.energy = energy
    this.food = []
    this.bloops = []
  }

  spawn(health, x, y) {
    console.log('Spawning:', health, x, y)
    let l = createVector(x, y)
    let dna = new DNA()
    this.bloops.push(new Bloop(l, dna, health))
  }

  distribute(energy) {
    return randint(1, energy)
  }
  
  conserve(energy) {
    this.energy = this.energy - energy
  }

  populate() {
    // Convert energy into bloops
    while(this.energy > 0) {
      let health = this.distribute(this.energy)
      this.spawn(health, random(width), random(height))
      this.conserve(health)

      // TODO: add food randomly
    }
  }

  spin() {
    this.bloops.forEachRev((b, i) => {
      b.spin()
      
      // TODO: send the bloop's state over websocket

      let foods = []

      // pass the bloop an observation
      b.observe(nearby.bloops, nearby.foods) // TODO: get this from websocket

      if (b.ate != null) {
        // this.food.remove(b.ate)
      }

      // has bloop selected a mate?
      if (b.mate && random(1) < odds) {
        let childDNA = b.actions.reproduce(b.mate)
        if (childDNA != null) {
          // TODO: parent give energy to child...
          childDNA.mutate(0.01)
          let child = new Bloop(b.position, childDNA)
          this.bloops.push(child) // TODO: send this over websocket
        }
      }
      if (b.dead()) {
        this.bloops.splice(i, 1)
        // this.food.add(b.position)
      }
      b.reset()
    })
  }
}