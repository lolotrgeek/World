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

  showdistance(position, objective, attractions) {
    // Draw distance
    push()
    fill(0)
    line(position.x, position.y, objective.x, objective.y)
    translate((position.x + objective.x) / 2, (position.y + objective.y) / 2)
    rotate(atan2(objective.y - position.y, objective.x - position.x))

    if (attractions > fuzz) {
      fill('#fff')
      text(nfc(attractions, 1), 0, -5)
    }
    pop()
  }

  wraparound(position, r) {
    // cause bloops to wrap around the envrironment
    if (position.x < -r) position.x = width + r
    if (position.y < -r) position.y = height + r
    if (position.x > width + r) position.x = -r
    if (position.y > height + r) position.y = -r
  }

  display(bloop) {
    ellipseMode(CENTER)
    stroke(0, bloop.health)
    let color = bloop.phenotype()
    fill(color.r, color.g, color.b, bloop.health)
    ellipse(bloop.position.x, bloop.position.y, bloop.radius, bloop.radius)
  }

  nearby(bloop, food) {
    let bloops = this.bloops.filter(other => {
      let distance = p5.Vector.dist(bloop.position, other.position)
      if (distance > bloop.skin && distance < bloop.observation_limit) return true
      else return false
    })
    // map the food values 
    let foodmap = food.map((foodLocation, i) => {
      return [i, foodLocation]
    })
    // filter out not nearby food
    let foods = foodmap.filter(nearbyfood => {
      let foodLocation = nearbyfood[1]
      let distance = p5.Vector.dist(bloop.position, foodLocation)
      if (distance < bloop.observation_limit) return true
      else return false
    })
    return { foods, bloops }
  }

  inside(bloop, thingLocation) {
    let distance = p5.Vector.dist(bloop.position, thingLocation)
    if (distance < bloop.skin) return true
    else return false
  }

  spin() {
    this.bloops.forEachRev((b, i) => {
      b.spin()
      
      // Show the bloop.
      this.wraparound(b.position, b.radius)
      this.display(b)

      let foods = []

      // see what is near each agent
      let nearby = this.nearby(b, foods)

      // pass the bloop an observation
      b.observe(nearby.bloops, nearby.foods) // TODO: send back over websocket (or is this all in node world?)

      // show nearby bloops
      nearby.bloops.map(near => this.showdistance(b.position, near.position, b.attractions))

      if (b.dead()) {
        this.bloops.splice(i, 1)
        // this.food.add(b.position)
      }
      b.reset()
    })
  }
}