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
    this.ports = []
    // generate unique ports
    while (this.ports.length < 1000) {
      let port = randint(10000, 20000)
      if (this.ports.findint(port) === false) {
        this.ports.push(port)
      }
    }
  }

  port() {
    let choice = Array.choice(this.ports)
    this.ports.remove(choice)
    return choice
  }

  manifest(b) {
    if (!b.position) b.position = { x: random(this.ports.length), y: random(this.ports.length) }
    if (!b.maxspeed) b.maxspeed = Math.map(b.dna.genes[0], 0, 1, 15, 0)
    if (!b.radius) b.radius = Math.map(b.dna.genes[0], 0, 1, 0, 50)
    if (!b.observation_limit) b.observation_limit = b.radius * 3
    if (!b.address) b.address = "ws://localhost:" + this.port()
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
    console.log('Spawning:', health)
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
    //   console.log('Look', action.look)
    // }
    // else if (action.move) {
    //   console.log('Move', action.move)
    // }
    // else if (action.replicate) {
    //   console.log('Replicate', action.replicate)
    // }
   } 

  step() {
    this.bloops.forEachRev((b, i) => {
      let action = b.sample()
      console.log('action', action)
      b.spin(action)

      if (b.action) {
        b.health -= this.cost(b.action)
        this.perform(b.action)  
      }

      if (b.health < 0.0) {
        this.bloops.splice(i, 1)
        this.ports.push(b.address)
      }
      // log(b)
      b.reset()
    })
    broadcast(JSON.stringify(this.bloops))
  }

  spin() {
    run()
    this.step()
    listen(msg => {
      if (msg === "WORLD") {
        // console.log(JSON.stringify({world: this}))
        return JSON.stringify({ world: this })
      }
      setInterval(() => this.step(), 1000)
      // console.log(bloops)
    })
  }
}

module.exports = { World }