// The "Mind-Head"

require('../utils/functions')
const { listen, send } = require('../utils/router')
const { Particle } = require('./particle')
const tag = "[World]"

class World {
  constructor(size = { x: 1000, y: 1000 }, energy = 4) {
    this.size = size // size (dimensions) of world
    this.energy = energy // number of particles
    this.particles = []
    this.positive = energy / 3
    this.negative = energy / 3
    this.neutral = energy / 3
    this.worlds = [] // list of connected "world" clients
    this.speed = 100 // ms
    this.count = 0
  }

  populate() {
    while (this.particles.length < this.energy) {
      let particle
      if(this.positive > 0) {
        particle = new Particle(1)
        this.positive--
      }
      else if(this.negative > 0) {
        particle = new Particle(-1)
        this.negative--
      }
      else if(this.neutral > 0) {
        particle = new Particle(0)
        this.neutral--
      }
      this.particles.push(particle)
    }
  }

  findDistance(x1, y1, x2, y2) {
    let a = x1 - x2
    let b = y1 - y2
    return Math.hypot(a, b)
  }

  wraparound(position, r) {
    // cause particles to wrap around the envrironment
    if (position.x < -r) position.x = this.size.x + r
    if (position.y < -r) position.y = this.size.y + r
    if (position.x > this.size.x + r) position.x = -r
    if (position.y > this.size.y + r) position.y = -r
  }

  step() {
    this.particles.forEach((particle, i) => {
      let neighbors = []
      let others = this.particles.map(particle => particle)
      others.splice(i, 1)
      others.forEach((other, i) => {
        let distance = this.findDistance(particle.position.x, particle.position.y, other.position.x, other.position.y)
        other.distance = distance
        let neighbor = {distance: other.distance, position: other.position, charge: other.charge}
        if (distance <= particle.aura) neighbors.push(neighbor)
      })
      particle.neighbors = neighbors
      particle.spin()
      this.wraparound(particle.position, particle.size)
    })
  }


  reset() {
    this.populate()
    listen(msg => {
      // listen for world renderers
      if (msg === "WORLD") {
        this.worlds.push("WORLD_"+this.worlds.length)
        send("WORLD", JSON.stringify({ start: this }))
      }
    })
  }

  spin() {
    this.reset()
    setInterval(() => {
      this.step()
      if (this.worlds.length > 0) send("WORLD", JSON.stringify({ world: this }))
      this.count++
    }, this.speed)
  }
}



module.exports = { World }