
class World {
  constructor(particles=[]) {
    this.particles = particles
    this.size = {x: 500, y: 500} // TODO: send through ports to visualize network space?
    this.p = null
  }

  showdistance(position, objective, attractions) {
    // Draw distance
    this.p.push()
    this.p.fill(0)
    this.p.line(position.x, position.y, objective.x, objective.y)
    this.p.translate((position.x + objective.x) / 2, (position.y + objective.y) / 2)
    this.p.rotate(this.p.atan2(objective.y - position.y, objective.x - position.x))

    if (attractions > 0) {
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
    this.p.stroke(0, particle.features.health)
    let color = particle.features.phenotype
    this.p.fill(color.r, color.g, color.b, particle.features.health)
    this.p.ellipse(particle.position.x, particle.position.y, particle.skin, particle.skin)
  }

  nearby(particle) {
    let particles = this.particles.forEach(other => {
      // let distance = p5.Vector.dist(particle.position, other.position)
      let distance = this.p.int(this.p.dist(particle.position.x, other.position.x, particle.position.y, other.position.y))
      if (distance > particle.skin && distance < particle.visual_space) {
        this.showdistance(particle.position, other.position, particle.features.attractions[0] - other.features.attractions[0])
      }
      else return false
    })
    return { particles }
  }

  inside(particle, thingLocation) {
    let distance = p5.Vector.dist(particle.position, thingLocation)
    if (distance < particle.skin) return true
    else return false
  }

  position(particle) {
    return this.p.createVector(particle.position.x, particle.position.y)
  }

  spin() {
    this.particles.forEach(particle => {
      particle.position = this.position(particle)
      this.wraparound(particle.position, particle.skin)
      this.display(particle)
      this.nearby(particle)
    })
  }
}