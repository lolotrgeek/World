// The "Mind-Head"

require('../utils/functions')
const { listen, send } = require('../utils/router')
const { Particle } = require('./particle')
const tag = "[World]"

class World {
  constructor(size, energy = 4) {
    this.size = size // size (dimensions) of world
    this.energy = energy // number of particles
    this.particles = []
    this.positive = energy / 3
    this.negative = energy / 3
    this.neutral = energy / 3
    this.worlds = [] // list of connected "world" clients
    this.speed = 100 // ms
    this.count = 0
    this.input = {x: this.size.x / 2, y: this.size.y/2} // middle
    this.output = {x: this.size.x / 2, y: 0} // bottom
  }

  populate() {
    while (this.particles.length < this.energy) {
      let particle
      let position = { x: randint(-this.size.x, this.size.x), y: randint(-this.size.y, this.size.y) }
      if(this.positive > 0) {
        particle = new Particle(1, position)
        this.positive--
      }
      else if(this.negative > 0) {
        particle = new Particle(-1, position)
        this.negative--
      }
      else if(this.neutral > 0) {
        particle = new Particle(0, position)
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

  constrain(position, r) {
    // cause particles to wrap around the envrironment
    if (position.x < 0) position.x = 0
    if (position.y < 0) position.y = 0
    if (position.x > this.size.x) position.x = this.size.x
    if (position.y > this.size.y) position.y = this.size.y
  }

  inputParticle() {
    // console.log("Particle added!")
    let particle = new Particle(Array.choice([-1, 0, 1]), {x: this.input.x + 10, y: this.input.y + 10})
    this.particles.push(particle)
  }

  outputParticle(particle, index) {
    let distance = this.findDistance(this.output.x, this.output.y, particle.position.x, particle.position.y)
    if(distance <= particle.aura) {
      // TODO: has a charge that attracts, is set externally in order to build agency
      this.particles.splice(index,1)
    }
  }

  testInput(){
    let trial = randint(-10,2)
    if(trial > 0) this.inputParticle()
  }

  step() {
    this.testInput()
    this.particles.forEach((particle, i) => {
      this.outputParticle(particle, i)
      let neighbors = []
      let others = this.particles.map(particle => particle)
      others.splice(i, 1)
      others.forEach((other, i) => {
        let distance = this.findDistance(particle.position.x, particle.position.y, other.position.x, other.position.y)
        other.distance = distance
        let neighbor = {distance: other.distance, position: other.position, charge: other.charge, size: other.size}
        if (distance <= particle.aura) neighbors.push(neighbor)
      })
      particle.neighbors = neighbors
      particle.spin()
      this.constrain(particle.position, particle.size)
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