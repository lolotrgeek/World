// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Evolution EcoSystem

class World {
  constructor() {
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
    let color = bloop.phenotype
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

  manifest(b) {
    if (!b.position) {
      b.position = {x : random(width), y: random(height)}
    }
    if (!b.maxspeed) {
      b.maxspeed = map(b.dna.genes[0], 0, 1, 15, 0)
    }
    if (!b.radius) {
      b.radius = map(b.dna.genes[0], 0, 1, 0, 50)
    }
    if (!b.observation_limit) {
      b.observation_limit = b.radius * 3
    }
    return b
  }

  position(b) {
    return createVector(b.position.x, b.position.y)
  }

  spin() {
    this.bloops.forEachRev((b, i) => {
      // Show the bloop.

      this.wraparound(b.position, b.radius)
      this.display(b)

      let foods = []

      // see what is near each agent

      let nearby = this.nearby(b, foods)

      // pass the bloop an observation
      // TODO: send back over websocket (or is this all in node world?)

      // show nearby bloops
      nearby.bloops.map(near => this.showdistance(b.position, near.position, b.attractions))

      b.nearby = nearby

      // un-vectorize
      b.position = { x: b.position.x, y: b.position.y }

      // console.log(JSON.stringify(b))
      // console.log(msg)

    })
    // ws.send(JSON.stringify(this.bloops))
  }
}