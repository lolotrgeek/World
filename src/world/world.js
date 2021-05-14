// The "Mind-Head"

require('./utils/functions')
const { listen, broadcast, send } = require('../server')
const tag = "[World]"

class World {
  constructor(size = { x: 1000, y: 1000 }, energy = 100, particles = []) {
    this.size = size // size (dimensions) of world
    this.energy = energy // number of particles
    this.particles = particles
    this.worlds = [] // list of connected "world" clients
    this.speed = 100 // ms
  }

  findDistance(x1, y1, x2, y2) {
    let a = x1 - x2
    let b = y1 - y2
    return Math.hypot(a, b)
  }

  step() {
    this.particles.forEach((particle, i) => {
      let neighbors = []
      let others = this.particles
      others.splice(i, 1)
      others.forEach((other, i) => {
        let distance = findDistance(particle.position.x, particle.position.y, other.position.x, other.position.y)
        other.distance = distance
        if (distance <= particle.aura) neighbors.push(other)
      })
      particle.neighbors = neighbors
    })
  }


  reset() {
    listen(msg => {
      // listen for world renderers
      if (msg === "WORLD") {
        this.worlds.push(world)
        send("WORLD", JSON.stringify({ start: this }))
      }
    })
  }

  spin() {
    this.reset()
    setInterval(() => {
      this.step()
      if (this.worlds.length > 0) send("WORLD", JSON.stringify({ world: this }))
    }, this.speed)
  }
}



module.exports = { World }