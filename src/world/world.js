// A Proxy for Reality

const { Bloop } = require('./creatures/bloop')
const { Module, Look, Move, Replicate } = require('./modules/actions')
const { DNA } = require('./creatures/dna')
const { run, listen, broadcast } = require('../server')

class World {
  constructor(energy = 1000, odds = 0.005, size = { x: 500, y: 500 }) {
    this.size = size
    this.odds = odds
    this.energy = energy
    this.bloops = []
    this.worlds = []
    this.agents = []
  }

  addAgent(agent) {
    this.agents.push(agent)
    log("AGENT ADDED")
    return
  }

  addWorld(world) {
    this.worlds.push(world)
    log("WORLD ADDED")
    return
  }

  manifest(b) {
    // set initial state of creature
    if (!b.state.position) b.state.position = { x: random(this.size.x), y: random(this.size.y) }
    if (!b.state.maxspeed) b.state.maxspeed = Math.map(b.dna.genes[0], 0, 1, 15, 0)
    if (!b.state.skin) b.state.skin = Math.map(b.dna.genes[0], 0, 1, 0, 50)
    if (!b.state.visual_space) b.state.visual_space = b.state.skin * 3 // observation limits
    if (!b.state.nearby) b.state.nearby = []
    return b
  }

  modulate(b) {
    // attach modules to the creature
    let modules = [new Module(), new Look(), new Move()]
    if (modules.length <= b.slots) {
      b.modules = modules
      b.slots -= modules.length
    }
    //TODO: handle trying to attach too many modules
    return b
  }

  spawn(health) {
    log('Spawning: ' + health)
    let dna = new DNA()
    let bloop = this.manifest(this.modulate(new Bloop(dna, health)))
    bloop.reset()
    bloop.name = this.bloops.length
    this.bloops.push(bloop)
    return bloop
  }

  distribute(energy) {
    return randint(1, energy)
  }

  conserve(energy) {
    this.energy = this.energy - energy
  }

  populate() {
    while (this.energy > 0) {
      let health = this.distribute(this.energy)
      this.spawn(health)
      this.conserve(health)
    }
  }

  cost(action) {
    // TODO: environmental forces factored into cost
    let cost = random(0, 1)
    this.energy += cost
    return cost
  }


  step() {
    this.bloops.forEachRev((b, i) => {
      if (b.health < 0.0) {
        this.bloops.splice(i, 1)
      }
      else if (b.action > 0) {
        b.spin(this.bloops, this.cost(b.action))
        b.reset()
      }
    })
  }

  addCreature(obj) {
    if (this.energy > 0) {
      this.addAgent(obj.agent.name)
      let health = this.distribute(this.energy)
      let bloop = this.spawn(health)
      this.conserve(health)
      // TODO: remove bloop on agent disconnect
      broadcast(JSON.stringify({ creature: bloop, actor: obj.agent.name }))
      console.log('energy' , this.energy)
    }
    else {
      broadcast(JSON.stringify({ creature: false }))
    }
  }

  setAction(obj) {
    // Look for bloop that matches obj.creature
    let found = null
    for (let i = 0; i < this.bloops.length; i++) {
      let bloop = this.bloops[i]
      if (bloop.name === obj.creature) {
        // mutate found bloop with action
        bloop.action = obj.action.choice
        bloop.params = obj.action.params
        // log('found ' + obj.creature)
        found = bloop
        break
      }
    }
    if (!found) {
      log(obj.creature + ' not found!')
    }
  }

  spin() {
    run()
    listen(msg => {
      // log(msg)
      if (msg === "WORLD") {
        this.addWorld("WORLD") // TODO: add uuid for worlds, live reloading
        return JSON.stringify({ world: this })
      }
      else {
          let obj = isObject(msg)
          if (obj && obj.agent) this.addCreature(obj)
          else if (obj && obj.action.choice > 0 && obj.creature >= 0) this.setAction(obj)
      }
    })
    setInterval(() => {
      this.step()
      // Observations:
      broadcast(JSON.stringify(this.bloops))
    }, 500)
  }
}

module.exports = { World }