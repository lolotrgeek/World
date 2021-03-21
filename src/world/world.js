// A Proxy for Reality

const { Bloop } = require('./creatures/bloop')
const { Look, Move, Replicate } = require('./modules/actions')
const { DNA } = require('./creatures/dna')
const { run, listen, broadcast } = require('../server')

//TODO: when an agent connects, spawn a bloop for the agent to control

class World {
  constructor(energy, odds) {
    this.odds = odds
    this.energy = energy
    this.bloops = []
  }

  manifest(b) {
    // TODO: update position to reflect agent connection?
    if (!b.position) b.position = { x: random(1000), y: random(1000) } 
    if (!b.maxspeed) b.maxspeed = Math.map(b.dna.genes[0], 0, 1, 15, 0)
    if (!b.radius) b.radius = Math.map(b.dna.genes[0], 0, 1, 0, 50)
    if (!b.observation_limit) b.observation_limit = b.radius * 3
    return b
  }

  modulate(b) {
    // attach modules to the creature
    let modules = [new Look(), new Move(), new Replicate()]
    if(modules.length <= b.slots) {
      b.modules = modules
      b.slots -= modules.length 
    }
    return b
  }

  spawn(health) {
    // TODO: spawn when an agent connects...
    log('Spawning: ' + health)
    let dna = new DNA()
    let bloop = this.manifest(this.modulate(new Bloop(dna, health)))
    this.bloops.push(bloop)
  }

  distribute(energy) {
    return randint(1, energy)
  }

  conserve(energy) {
    this.energy = this.energy - energy
  }

  populate() {
    // Convert energy into bloops
    while (this.energy > 0) {
      let health = this.distribute(this.energy)
      this.spawn(health)
      this.conserve(health)
    }
  }

  cost(action) {
    return random(0, 1)
  }

  perform(action) {
    // if(action.look) {
    //   log('Look', action.look)
    // }
    // else if (action.move) {
    //   log('Move', action.move)
    // }
    // else if (action.replicate) {
    //   log('Replicate', action.replicate)
    // }
   } 

  step() {
    this.bloops.forEachRev((b, i) => {
      let action = b.action
      // log('action: ' + action)
      b.spin(action)

      if (b.action > 0) {
        b.health -= this.cost(b.action)
        this.perform(b.action)  
      }
      log(b.health)
      if (b.health < 0.0) {
        this.bloops.splice(i, 1)
        this.ports.push(b.address)
      }
      // log(b)
      b.reset()
    })
  }

  spin() {
    run()
    listen(msg => {
      // log(msg)
      if (msg === "WORLD") {
        // log(JSON.stringify({world: this}))
        return JSON.stringify({ world: this })
      }
      if(msg === 'AGENT') {

      }
      // log(bloops)
    })    
    setInterval(() => {
      this.step()
      broadcast(JSON.stringify(this.bloops))
    }, 500)
  }
}

module.exports = { World }