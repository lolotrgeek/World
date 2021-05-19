// The "Mind-Head"

require('../utils/functions')
const { listen, send } = require('../utils/router')
const { Particle, InputParticle, OutputParticle } = require('./particle')
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
    this.count = {negative: 0, positive: 0, neutral: 0}
    this.steps = 0
  }

  populate() {

    this.particles.push(new InputParticle(1, { x: this.size.x, y: this.size.x}))
    this.particles.push(new InputParticle(-1, { x: 0, y: this.size.x}))

    this.particles.push(new OutputParticle(1, { x: this.size.x, y: 0}))
    this.particles.push(new OutputParticle(-1, { x: 0, y: 0}))


    while (this.particles.length < this.energy) {
      let particle
      let position = { x: randint(-this.size.x, this.size.x), y: randint(-this.size.y, this.size.y) }
      if (this.positive > 0) {
        particle = new Particle(1, position)
        this.positive--
      }
      else if (this.negative > 0) {
        particle = new Particle(-1, position)
        this.negative--
      }
      else if (this.neutral > 0) {
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
    // cause particles to stay within bounds of the envrironment
    if (position.x < 0) position.x = 0 + r
    if (position.y < 0) position.y = 0 + r
    if (position.x > this.size.x) position.x = this.size.x - r
    if (position.y > this.size.y) position.y = this.size.y - r
  }

  countCharge(particle){
    if(particle.charge === -1)this.count.negative++
    if(particle.charge === 1)this.count.positive++
    if(particle.charge === 0)this.count.neutral++
  }

  produceNeutral(particle, other, distance) {
    if (distance < particle.size + other.size) {
      if(particle.charge === other.charge) {
        other.charge = 0
        particle.charge = 0
      }
    }    
  }
  particleGenerator(){
    return randint(-10, 2)
  }

  particleDestroyer(index){
    this.particles.splice(index, 1)
  }

  step() {
    this.particles.forEach((particle, self) => {
      if (particle.constructor.name === "InputParticle") {
        if (this.particleGenerator() > 0) {
          let incoming_particle = new Particle(particle.charge, {x: particle.position.x + particle.size, y: particle.position.y + particle.size})
          this.particles.push(incoming_particle)
        }
      }
      let neighbors = []
      let others = this.particles.map(particle => particle)
      others.forEach((other, index) => {
        if(index === self) return
        let distance = this.findDistance(particle.position.x, particle.position.y, other.position.x, other.position.y)
        if (particle.constructor.name === "OutputParticle" && distance <= other.aura) this.particleDestroyer(index)
        other.distance = distance
        let neighbor = { distance: other.distance, position: other.position, charge: other.charge, size: other.size }
        if (distance <= particle.aura) neighbors.push(neighbor)
      })
      particle.neighbors = neighbors
      particle.spin()
      this.constrain(particle.position, particle.size)
      // this.countCharge(particle)
    })

  }


  reset() {
    this.populate()
    listen(msg => {
      // listen for world renderers
      if (msg === "WORLD") {
        this.worlds.push("WORLD_" + this.worlds.length)
        send("WORLD", JSON.stringify({ start: this }))
      }
    })
  }

  spin() {
    this.reset()
    setInterval(() => {
      this.step()
      if (this.worlds.length > 0) send("WORLD", JSON.stringify({ world: this }))
      this.steps++
    }, this.speed)
  }
}



module.exports = { World }