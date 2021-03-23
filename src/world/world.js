// A Proxy for Reality

const { Bloop } = require('./creatures/bloop')
const { Module, Look, Move, Replicate } = require('./modules/actions')
const { DNA } = require('./creatures/dna')
const { run, listen, broadcast } = require('../server')

//TODO: when an agent connects, spawn a bloop for the agent to control

class World {
  constructor(energy, odds) {
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
    // TODO: update position to reflect agent connection?
    if (!b.position) b.position = { x: random(1000), y: random(1000) }
    if (!b.maxspeed) b.maxspeed = Math.map(b.dna.genes[0], 0, 1, 15, 0)
    if (!b.radius) b.radius = Math.map(b.dna.genes[0], 0, 1, 0, 50)
    if (!b.observation_limit) b.observation_limit = b.radius * 3
    return b
  }

  modulate(b) {
    // attach modules to the creature
    let modules = [new Module(), new Look(), new Move(), new Replicate()]
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
    return random(0, 1)
  }

  step() {
    this.bloops.forEachRev((b, i) => {
      b.spin(b.action)

      if (b.action > 0) {
        let cost = this.cost(b.action)
        b.health -= cost
        let module = b.modules[b.action]
        log(`bloop: {name: ${b.name} , action: ${b.action}, module: ${module.constructor.name}, cost: ${cost}, health: ${b.health} `)
      }
      if (b.health < 0.0) {
        this.bloops.splice(i, 1)
      }
      b.reset()
    })
  }

  spin() {
    run()
    listen(msg => {
      // log(msg)
      if (msg === "WORLD") {
        // log(JSON.stringify({world: this}))
        this.addWorld("WORLD") // TODO: add uuid for worlds
        return JSON.stringify({ world: this })
      }
      else {
        try {
          let obj = JSON.parse(msg)
          // log(obj)
          if (obj.agent) {
            if (this.energy > 0) {
              this.addAgent(obj.agent.name)
              let health = this.distribute(this.energy)
              let bloop = this.spawn(health)
              this.conserve(health)
              // log(JSON.stringify({ creature: bloop }))
              // TODO: remove bloop on agent disconnect
              broadcast(JSON.stringify({ creature: bloop, actor: obj.agent.name }))
              // return { creature: bloop }
            }
            else {
              broadcast(JSON.stringify({ creature: false }))
              // return {creature: false} 
            }
          }
          else if (obj.action >= 0 && obj.creature >= 0) {
            // NOTE: action is set here...
            let found = null
            for (let i = 0; i < this.bloops.length; i++) {
              let bloop = this.bloops[i]
              if (bloop.name === obj.creature) {
                bloop.action = obj.action
                // log('found ' + obj.creature)
                found = bloop
                break
              }
            }

            if (!found) {
              log(obj.creature + ' not found!')
              console.log(obj.creature, ' not found in ', this.bloops)
            }
            
            // log("action" + this.bloops[obj.creature])
            // log(this.bloops[obj.creature].health)
          } 
        }
        catch (err) {
          // log(err)
        }

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