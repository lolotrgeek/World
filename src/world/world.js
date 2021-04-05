// A Proxy for Reality

const { Bloop } = require('./creatures/bloop')
const { Module, Look, Move, Replicate } = require('./modules/actions')
const { DNA } = require('./creatures/dna')

const { run, listen, broadcast, send } = require('../server')
const tag = "[World]"

class World {
  constructor(energy = 1000, odds = 0.005, size = { x: 500, y: 500 }) {
    this.speed = 100
    this.size = size
    this.odds = odds
    this.energy = energy
    this.bloops = []
    this.worlds = []
    this.agents = []
    this.queue = [] // agents waiting for a creature to spawn
  }

  addAgent(agent) {
    this.agents.push(agent)
    log(`${tag} AGENT ADDED`)
    return
  }

  addWorld(world) {
    this.worlds.push(world)
    log(`${tag} WORLD ADDED`)
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
    // set initial features of creature
    log(`${tag} Spawning : ${health}`)
    let dna = new DNA()
    let bloop = this.manifest(this.modulate(new Bloop(dna, health)))
    bloop.reset()
    bloop.name = this.bloops.length
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
    // TODO: factor environmental forces into cost
    let cost = random(0, 1)
    this.energy += cost
    return cost
  }

  addCreature(agent) {
    if (this.energy > 0) {
      let health = this.distribute(this.energy)
      let bloop = this.spawn(health)
      this.conserve(health)
      bloop.agent = agent
      this.bloops.push(bloop)
      return bloop
    }
    else return null
  }

  /**
   * 
   * @param {number} creature the integer representing a creature
   * @returns `{index, creature}`
   */
  findCreature(creature) {
    let found = { index: -1, creature: null }
    for (let i = 0; i < this.bloops.length; i++) {
      let bloop = this.bloops[i]
      if (bloop.name === creature) {
        found.creature = bloop
        found.index = i
        break
      }
    }
    return found
  }

  /**
   * 
   * @param {number} creature the integer representing a creature's name
   * @returns `{index, creature}`
   */
  seekCreature(creature) {
    let sought = { index: -1, creature: null }
    if (typeof creature !== 'number' || creature < 0) {
      log(`${tag} No Creature ${creature}`)
    }
    else {
      let bloop
      if (this.bloops[creature]) {
        bloop = this.bloops[creature]
        log(`${tag} Seeking creature ${creature}, found ${bloop.name}`, 0)
        sought.creature = bloop
        sought.index = creature
      }
      else if (bloop && bloop.name !== creature) {
        log(`${tag} Seeking creature ${creature}, found wrong ${bloop.name}`, 0)
        sought = this.findCreature(creature)
      }
      else if (!bloop) {
        log(`${tag} Seeking creature ${creature} not found`, 0)
      }
    }
    return sought
  }

  /**
   * 
   * @param {number} action integer that corresponds with action
   * @returns `{}` | `{action}`
   */
  setAction(action) {
    if (action) {
      action.last_action = Date.now()
      return action
    } else {
      return {}
    }
  }

  step() {
    // check for agents waiting for a creature
    this.queue.forEachRev(agent => {
      let bloop = this.addCreature(agent)
      let response = { creature: bloop, agent: agent }
      if (bloop) this.addAgent(agent)
      send(agent, JSON.stringify(response))
    })

    this.bloops.forEachRev((b, i) => {
      if (b.health < 0.0) {
        send(b.agent, { dead: b })
        this.bloops.splice(i, 1)
        log(`${tag} Creature ${b.name} Died from 0 Health.`)
      }
      // Handle Actions
      // action: { choice: int, params: [], last_action: int }
      // Make sure we have a new action for this step, otherwise assume agent died...
      else if (Date.now() - b.action.last_action > this.speed * 2) {
        send(b.agent, { dead: b })
        this.bloops.splice(i, 1)
        this.agents.splice(this.agents.find(agent => agent === b.agent), 1)
        log(`${tag} Creature ${b.name} Died from No agent.`)
      }
      // Perform observation and action
      else if (b.action.choice > 0) {
        log(`${tag} Creature Action ${b.action.choice}`, 0)
        let full_observation = this.bloops.filter((bloop, index) => index !== i)
        //TODO: segment observation using Look module
        b.spin(full_observation, this.cost(b.action.choice))
        send(b.agent, b.observations)
        b.reset()

      }
      this.queue = [] // clearing queue ensures that only living agents will be re-added next step
    })
  }

  reset() {
    listen(msg => {
      // listen for world renderers
      if (msg === "WORLD") {
        this.addWorld("WORLD") // TODO: add uuid for worlds and live reloading
        return JSON.stringify({ world: this })
      }
      // listen for agent messages
      else {
        let obj = getObject(msg)
        if (obj) {
          // Handle new or returning Agent messages
          // agent message { name: string}
          if (obj.name) {
            let found = this.agents.find(agent => agent === obj.name)
            if (!found) {
              log(`${tag} Adding agent ${obj.name} to queue.`, 0)
              this.queue.push(obj.name)
            }
          }
          // Handle Actions messages
          // action message { action: {choice: int, params: []}, agent: string, creature: number }
          else if (obj.action) {
            let found = this.seekCreature(obj.creature)
            let action = this.setAction(obj.action)
            // ISSUE: bloop could die before it gets assigned this action, which could result in wrong bloop being assigned action.
            // how to ensure correct bloop gets action being sent to it? -> make bloops autonomous (own process/port) -or- recheck bloop health and agent before assignment 
            let creature = this.bloops[found.index]
            if (creature && creature.health > 0 && creature.agent === obj.agent) {
              log(`${tag} Action assigment: ${creature.health} ${creature.agent}`, 0)
              this.bloops[found.index].action = action
            }
            // modify message in the following...
            log(`${tag} Action: ${found.index} : ${JSON.stringify(action)}`, 0)

          }
          // handle unknown messages
          else {
            log(`${tag} Unknown: ${JSON.stringify(obj)}`)
          }
        }
      }
    })
  }

  spin() {
    run()
    this.reset()
    setInterval(() => {
      this.step()
      if (this.worlds.length > 0) {
        //TODO: uuid worlds for multiple, iterate through each to send 
        send("WORLD" , JSON.stringify(this.bloops))
      }
    }, this.speed)
  }
}

module.exports = { World }