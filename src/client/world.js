// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Evolution EcoSystem

class World {
  constructor({bloops, energy, ports }) {
    this.food = energy
    this.bloops = bloops
    this.size = {x: ports.length, y: ports.length} // network space to visual space
    this.p = null
  }

  showdistance(position, objective, attractions) {
    // Draw distance
    this.p.push()
    this.p.fill(0)
    this.p.line(position.x, position.y, objective.x, objective.y)
    this.p.translate((position.x + objective.x) / 2, (position.y + objective.y) / 2)
    this.p.rotate(p.atan2(objective.y - position.y, objective.x - position.x))

    if (attractions > fuzz) {
      this.p.fill('#fff')
      this.p.text(nfc(attractions, 1), 0, -5)
    }
    this.p.pop()
  }

  wraparound(position, r) {
    // cause bloops to wrap around the envrironment
    if (position.x < -r) position.x = this.p.width + r
    if (position.y < -r) position.y = this.p.height + r
    if (position.x > this.p.width + r) position.x = -r
    if (position.y > this.p.height + r) position.y = -r
  }

  display(bloop) {
    this.p.ellipseMode(this.p.CENTER)
    this.p.stroke(0, bloop.health)
    let color = bloop.phenotype
    this.p.fill(color.r, color.g, color.b, bloop.health)
    this.p.ellipse(bloop.position.x, bloop.position.y, bloop.radius, bloop.radius)
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
      b.position = {x : this.p.random(this.size.x), y: this.p.random(this.size.y)}
    }
    if (!b.maxspeed) {
      b.maxspeed = this.p.map(b.dna.genes[0], 0, 1, 15, 0)
    }
    if (!b.radius) {
      b.radius = this.p.map(b.dna.genes[0], 0, 1, 0, 50)
    }
    if (!b.observation_limit) {
      b.observation_limit = b.radius * 3
    }
    return b
  }

  position(b) {
    return this.p.createVector(b.position.x, b.position.y)
  }
ks
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