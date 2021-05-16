
class World {
  constructor(particles = [], size={ x: 500, y: 500 }) {
    this.particles = particles
    this.size = size
    this.p = null
  }

  showdistance(position, objective, attractions) {
    // Draw distance
    this.p.push()
    this.p.fill(0)
    this.p.line(position.x, position.y, objective.x, objective.y)
    this.p.translate((position.x + objective.x) / 2, (position.y + objective.y) / 2)
    this.p.rotate(this.p.atan2(objective.y - position.y, objective.x - position.x))

    if (attractions) {
      this.p.fill('#fff')
      this.p.text(this.p.nfc(attractions, 1), 0, -5)
    }
    this.p.pop()
  }

  wraparound(position, r) {
    // cause particles to wrap around the envrironment
    if (position.x < -r) position.x = this.p.width + r
    if (position.y < -r) position.y = this.p.height + r
    if (position.x > this.p.width + r) position.x = -r
    if (position.y > this.p.height + r) position.y = -r
  }

  display(particle) {
    this.p.ellipseMode(this.p.CENTER)
    let color
    if (particle.charge === -1) color = "#0004FF"
    else if (particle.charge === 0) color = "#000"
    else if (particle.charge === 1) color = "#FF0000"
    this.p.stroke(color)
    this.p.fill(color)
    this.p.ellipse(particle.position.x, particle.position.y, particle.size, particle.size)
  }

  nearby(particle) {
    if (particle.neighbors.length > 0) {
      particle.neighbors.forEach(neighbor => {
        this.showdistance(particle.position, neighbor.position, neighbor.attraction)
      })
    }
  }

  inside(particle, thingLocation) {
    let distance = p5.Vector.dist(particle.position, thingLocation)
    if (distance < particle.size) return true
    else return false
  }

  position(particle) {
    return this.p.createVector(particle.position.x, particle.position.y)
  }

  spin() {
    this.particles.forEach(particle => {
      particle.position = this.position(particle)
      this.wraparound(particle.position, particle.size)
      this.display(particle)
      // this.nearby(particle)
    })
  }
}