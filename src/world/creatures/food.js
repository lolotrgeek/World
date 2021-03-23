// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Evolution EcoSystem

// A collection of food in the world

class Food {
  constructor(energy) {
    this.energy = energy
  }

  // Add some food at a location
  add(l) {
    let location = l.copy()
    let energy = this.energy
    this.food.push({location, energy})
  }

  // Add some food at a location
  remove(i) {
    this.food.splice(i, 1)
  }

  // Display the food
  run() {
    for (let i = 0; i < this.food.length; i++) {
      let f = this.food[i]
      rectMode(CENTER)
      stroke(0)
      fill(127)
      rect(f.x, f.y, 8, 8)
    }

    // There's a small chance food will appear randomly
    if (random(1) < 0.001) {
      this.food.push(createVector(random(width), random(height)))
    }
  }

  // Return the list of food
  getFood() {
    return this.food
  }
}