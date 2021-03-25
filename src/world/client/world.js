// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Evolution EcoSystem

class World {
  constructor({bloops, energy, ports }) {
    this.food = energy
    this.bloops = bloops
    this.size = {x: 1000, y: 1000} // TODO: send through ports to visualize network space?
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
    this.p.ellipse(bloop.state.position.x, bloop.state.position.y, bloop.state.radius, bloop.state.radius)
  }

  nearby(bloop, food) {
    let bloops = this.bloops.filter(other => {
      let distance = p5.Vector.dist(bloop.state.position, other.state.position)
      if (distance > bloop.skin && distance < bloop.state.visual_space) return true
      else return false
    })
    // map the food values 
    let foodmap = food.map((foodLocation, i) => {
      return [i, foodLocation]
    })
    // filter out not nearby food
    let foods = foodmap.filter(nearbyfood => {
      let foodLocation = nearbyfood[1]
      let distance = p5.Vector.dist(bloop.state.position, foodLocation)
      if (distance < bloop.state.visual_space) return true
      else return false
    })
    return { foods, bloops }
  }

  inside(bloop, thingLocation) {
    let distance = p5.Vector.dist(bloop.state.position, thingLocation)
    if (distance < bloop.skin) return true
    else return false
  }

  manifest(b) {
    if (!b.state.position) {
      b.state.position = {x : this.p.random(this.size.x), y: this.p.random(this.size.y)}
    }
    if (!b.state.maxspeed) {
      b.state.maxspeed = this.p.map(b.dna.genes[0], 0, 1, 15, 0)
    }
    if (!b.state.radius) {
      b.state.radius = this.p.map(b.dna.genes[0], 0, 1, 0, 50)
    }
    if (!b.state.visual_space) {
      b.state.visual_space = b.state.radius * 3
    }
    return b
  }

  position(b) {
    return this.p.createVector(b.state.position.x, b.state.position.y)
  }

  spin() {
    this.bloops.forEach(bloop => {
      let position = this.position(bloop)
      this.wraparound(position, bloop.state.radius)
      this.display(bloop)
    })
    // ws.send(JSON.stringify(this.bloops))
  }
}