// A Proxy for Reality

const { Bloop } = require('./creatures/bloop')
const { Module, Look, Move, Replicate } = require('./modules/actions')
const { DNA } = require('./creatures/dna')
const { run, listen, broadcast } = require('../server')

//TODO: when an agent connects, spawn a bloop for the agent to control

class World {
  constructor(energy=1000, odds=0.005, size={x:500, y: 500}) {
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
    // TODO: update position to reflect agent connection? (network space)
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
    // let modules = [new Module(), new Look(), new Move(), new Replicate()]
    let modules = [new Module(), new Move()]
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

  cost() {
    return random(0, 1)
  }

  step() {
    this.bloops.forEachRev((b, i) => {
      b.spin(b.action)
      //TODO: move this into bloop spin?
      if (b.action > 0) {
        b.observations = this.bloops
        let module = b.modules[b.action]
        let result = module.spin(b)
        // add key/value of result to state object
        let newstate = Object.keys(result)
        if(newstate.length > 0) newstate.forEach(key => b.state[key] = result[key])
        let cost = this.cost() // TODO: environmental forces factored into cost 
        b.health -= cost
        // log(`bloop: {name: ${b.name} , action: ${b.action}, module: ${module.constructor.name}, cost: ${cost}, health: ${b.health} `)
        console.log(result, b.state.position)
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
              // TODO: remove bloop on agent disconnect
              broadcast(JSON.stringify({ creature: bloop, actor: obj.agent.name }))
              log(this.energy)
            }
            else {
              broadcast(JSON.stringify({ creature: false }))
              // return {creature: false} 
            }
          }
          else if (obj.action.choice > 0 && obj.creature >= 0) {
            // NOTE: action is set here...
            // Look for bloop
            let found = null
            for (let i = 0; i < this.bloops.length; i++) {
              let bloop = this.bloops[i]
              if (bloop.name === obj.creature) {
                bloop.action = obj.action.choice
                bloop.params = obj.action.params
                // log('found ' + obj.creature)
                found = bloop
                break
              }
            }

            if (!found) {
              // log(obj.creature + ' not found!')
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