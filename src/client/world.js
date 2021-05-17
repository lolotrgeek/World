
class World {
  constructor(particles, size, input, output) {
    this.particles = particles
    this.size = size
    this.input = input
    this.output = output
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

  displayIO(){
    this.p.square(this.input.x, this.input.y, 10)
    this.p.square(this.output.x, this.output.y, 10)
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
    this.displayIO()
    this.particles.forEach(particle => {
      particle.position = this.position(particle)
      this.display(particle)
      // this.nearby(particle)
    })
  }
}