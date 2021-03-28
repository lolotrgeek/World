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
    this.p.ellipse(bloop.state.position.x, bloop.state.position.y, bloop.state.skin, bloop.state.skin)
  }

  nearby(bloop) {
    let bloops = this.bloops.filter(other => {
      // let distance = p5.Vector.dist(bloop.state.position, other.state.position)
      let distance = this.p.int(this.p.dist(bloop.state.position.x, other.state.position.x, bloop.state.position.y, other.state.position.y))
      if (distance > bloop.state.skin && distance < bloop.state.visual_space) return true
      else return false
    })
    return { bloops }
  }

  inside(bloop, thingLocation) {
    let distance = p5.Vector.dist(bloop.state.position, thingLocation)
    if (distance < bloop.state.skin) return true
    else return false
  }

  manifest(b) {
    if (!b.state.position) {
      b.state.position = {x : this.p.random(this.size.x), y: this.p.random(this.size.y)}
    }
    if (!b.state.maxspeed) {
      b.state.maxspeed = this.p.map(b.dna.genes[0], 0, 1, 15, 0)
    }
    if (!b.state.skin) {
      b.state.skin = this.p.map(b.dna.genes[0], 0, 1, 0, 50)
    }
    if (!b.state.visual_space) {
      b.state.visual_space = b.state.skin * 3
    }
    return b
  }

  position(b) {
    return this.p.createVector(b.state.position.x, b.state.position.y)
  }

  spin() {
    this.bloops.forEach(bloop => {
      bloop.state.position = this.position(bloop)
      this.wraparound(bloop.state.position, bloop.state.skin)
      this.display(bloop)
      this.nearby(bloop)
    })
  }
}