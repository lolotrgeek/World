// The "Mind-Head"
// Sets the environment (rules) for particles to interact within.

require('../utils/functions')
const { listen, send } = require('../utils/router')
const { Particle } = require('./particles/Particle')
const { InputParticle } = require('./particles/InputParticle')
const { OutputParticle } = require('./particles/OutputParticle')
const tag = "[World]"

class Mind {
  constructor(size) {
    this.size = size // size (dimensions) of mind
    this.particles = []
    this.count = { negative: 0, positive: 0, neutral: 0 }
    this.steps = 0
  }

  populate() {
    this.particles.push(new InputParticle(1, { x: this.size.x, y: this.size.x }))
    this.particles.push(new InputParticle(0, { x: 0, y: this.size.x / 2 }))
    this.particles.push(new InputParticle(-1, { x: 0, y: this.size.x }))

    this.particles.push(new OutputParticle(0, { x: this.size.x, y: 0 }))
    this.particles.push(new OutputParticle(0, { x: 0, y: 0 }))
  }

  findDistance(x1, y1, x2, y2) {
    let a = x1 - x2
    let b = y1 - y2
    return Math.hypot(a, b)
  }

  constrain(position, r) {
    // cause particles to stay within bounds of the envrironment
    if (position.x < 0) position.x = 0 + r
    if (position.y < 0) position.y = 0 + r
    if (position.x > this.size.x) position.x = this.size.x - r
    if (position.y > this.size.y) position.y = this.size.y - r
  }

  countCharge(particle) {
    if (particle.charge === -1) this.count.negative++
    if (particle.charge === 1) this.count.positive++
    if (particle.charge === 0) this.count.neutral++
  }

  particleOutlet(particle, other, index, distance) {
    if (particle.constructor.name === "OutputParticle" && distance <= other.aura) this.particles.splice(index, 1)
  }

  step() {
    this.particles.forEach((particle, self) => {
      let neighbors = []
      let others = this.particles.map(particle => particle)
      others.forEach((other, index) => {
        if (index === self) return
        let distance = this.findDistance(particle.position.x, particle.position.y, other.position.x, other.position.y)
        other.distance = distance
        let neighbor = { distance: other.distance, position: other.position, charge: other.charge, size: other.size }
        if (distance <= particle.aura) neighbors.push(neighbor)
        this.particleOutlet(particle, other, index, distance)
      })
      particle.neighbors = neighbors
      particle.spin()
      this.constrain(particle.position, particle.size)
      // this.countCharge(particle)
    })

  }


  reset() {
    listen(msg => {
      // listen for world renderers
      if (msg === "WORLD") {
        this.worlds.push("WORLD_" + this.worlds.length)
        send("WORLD", JSON.stringify({ start: this }))
      }
    })
  }

  spin() {
    this.step()
    this.steps++
  }
}

module.exports = { Mind }