// A Proxy for Reality

const { Bloop } = require('./creatures/bloop')
const { Module, Look, Move, Select } = require('./modules/actions')
const { DNA } = require('./creatures/dna')

const { listen, broadcast, send } = require('../server')
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
    log(`${tag} AGENT ADDED`, 0)
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
    if (!b.state.maxspeed) b.state.maxspeed = Math.map(b.features.dna.genes[0], 0, 1, 15, 0)
    if (!b.state.skin) b.state.skin = Math.map(b.features.dna.genes[0], 0, 1, 0, 50)
    if (!b.state.visual_space) b.state.visual_space = b.state.skin * 5 // observation limits
    if (!b.state.nearby) b.state.nearby = []
    if (!b.state.selection) b.state.selection = {}
    return b
  }

  modulate(b) {
    // attach modules to the creature
    let modules = [new Module(), new Select, new Look(), new Move()]
    if (modules.length <= b.slots) {
      b.modules = modules
      b.slots -= modules.length
    }
    //TODO: handle trying to attach too many modules
    return b
  }

  spawn(health, dna = new DNA()) {
    // set initial features of creature
    log(`${tag} Spawning : ${health}`, 0)
    let bloop = this.manifest(this.modulate(new Bloop(dna, health)))
    bloop.reset()
    bloop.features.name = this.bloops.length
    return bloop
  }

  distribute(energy) {
    return randint(1, energy)
  }

  conserve(energy) {
    this.energy -= energy
    log(`${tag} Conserving : ${energy} of ${this.energy}`, 0)

  }

  cost(action) {
    // TODO: factor environmental forces into cost
    let cost = random(0, 1)
    this.energy += cost
    return cost
  }

  addCreature(agent) {
    if (this.energy > 0) {
      let health = randint(1, this.energy)
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
      if (bloop.features.name === creature) {
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
        log(`${tag} Seeking creature ${creature}, found ${bloop.features.name}`, 0)
        sought.creature = bloop
        sought.index = creature
      }
      else if (bloop && bloop.features.name !== creature) {
        log(`${tag} Seeking creature ${creature}, found wrong ${bloop.features.name}`, 0)
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
    this.queue.forEachRev((agent, i) => {
      log(`${tag} Agent Waiting, ${agent.name}`, 0)
      // Handle Disconnected Agents

      if (Date.now() - agent.time > this.speed * 2) {
        log(`${tag} Agent ${agent.name} in queue is dead.`, 0)
        this.queue.splice(i, 1)
      }

      // Divine Intervention To convert energy to Creature
      let threshold = random(-10, 1)

      if (threshold > this.odds) {
        log(`${tag} Threshold passed! Spawning ${agent.name}`, 0)
        let bloop = this.addCreature(agent.name)
        let response = { creature: bloop, agent: agent.name }
        if (bloop) {
          this.addAgent(agent.name)
          this.queue.splice(i, 1)
        }
        send(agent.name, JSON.stringify(response))
      }
    })
    let creature_energy = 0
    this.bloops.forEachRev((b, i) => {
      // Handle Death from natural causes
      if (b.features.health <= 0.0) {
        send(b.agent, { dead: b })
        this.bloops.splice(i, 1)
        let agentIndex = this.agents.findIndex(agent => agent === b.agent)
        // console.log("Agent Back to Queue:", this.agents[agentIndex])
        this.agents.splice(agentIndex, 1)
        this.energy += b.features.health
        log(`${tag} Creature ${b.features.name} Died from 0 Health. ${b.features.health}`, 0)
      }
      // Handle Death when no new action for this step...
      else if (Date.now() - b.action.last_action > this.speed * 2) {
        send(b.agent, { dead: b })
        this.bloops.splice(i, 1)
        let agentIndex = this.agents.findIndex(agent => agent === b.agent)
        // console.log("Agent Back to Queue:", this.agents[agentIndex])
        this.agents.splice(agentIndex, 1)
        log(`${tag} Creature ${b.features.name} Died from No agent.`, 0)
        this.energy += b.features.health
      }
      // Not Dead!
      else {
        // Handle State
        if (b.state) {
          if (b.state.selection && Object.keys(b.state.selection).length > 0) {
            // console.log('Selection:', b.state.selection)
            // selection {mate: {creature.features}, payment: {int}}

            let parent_dna = b.features.dna.copy()
            let child_dna = parent_dna.mutate(.02)
            // Asexual - "nearby" is the trigger to reproduce, see Select() module
            let childfeatures = {
              dna: child_dna,
              health: b.state.selection.payment
            }

            if (this.queue.length > 0) {
              log(`${tag} Reproducing: Parent ${b.features.name} agent. Energy ${childfeatures.health}`, 1)
              //randomly pick an agent from the queue
              let chosen = randint(this.queue.length)
              let agent = this.queue[chosen]
              let child = this.spawn(childfeatures.health, childfeatures.dna)
              // conserve - paid health of parent into child health
              b.features.health -= b.state.selection.payment
              // modified addCreature sequence
              child.agent = agent
              this.bloops.push(child)
              let response = { creature: child, agent: agent }
              if (child) {
                this.addAgent(agent)
                this.queue.splice(chosen, 1)
              }
              send(agent, JSON.stringify(response))
            }



            // Sexual
            // TODO: decide if mating is reciprocal
            // upon selection this sends reproduction request to creature by name
            // let mate = this.seekCreature(b.state.selection.mate.name)
            // the creature then sends this mate request to agent...
          }
        }
        // Handle Actions
        // action: { choice: int, params: [], last_action: int }
        // Perform action, send observation
        if (b.action.choice > 0) {
          log(`${tag} Creature ${b.features.name} Action ${b.action.choice}`, 0)
          let full_observation = this.bloops.filter((bloop, index) => index !== i) // filter out self from observation
          let cost = random(0, 1)
          if(cost < 0) console.log(cost)
          b.spin(full_observation, cost)
          b.features.health -= cost 
          this.energy += cost // "pay" world the cost of the action
          send(b.agent, { state: b.state })
          
          b.reset()
        }
        creature_energy += b.features.health
      }
    })
    if(this.energy + creature_energy > 1000) log(`${tag} Total : ${creature_energy + this.energy} | Available ${this.energy}`, 0 )
  }

  reset() {
    listen(msg => {
      // listen for world renderers
      if (msg === "WORLD") {
        this.addWorld("WORLD") // TODO: add uuid for worlds and live reloading
        return JSON.stringify({ start: { bloops: this.bloops, energy: this.energy } })
      }
      // listen for agent messages
      else {
        let obj = getObject(msg)
        if (obj) {
          // Handle new or returning Agent messages
          // agent message { name: string, time: number}
          if (obj.name) {
            let inAgents = this.agents.find(agent => agent === obj.name)
            let queued = this.queue.findIndex(agent => agent.name === obj.name)
            let inQueue = queued > -1
            if (!inAgents && !inQueue) {
              log(`${tag} Adding agent ${obj.name} to queue.`, 0)
              this.queue.push(obj)
            } else if (!inAgents && inQueue) {
              log(`${tag} Updating agent ${obj.name} in queue.`, 0)
              this.queue[queued] = obj
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
            if (creature && creature.features.health > 0 && creature.agent === obj.agent) {
              log(`${tag} Action assigment: ${creature.features.health} ${creature.agent}`, 0)
              this.bloops[found.index].action = action
            }
            // modify message in the following...
            log(`${tag} Action: ${found.index} : ${JSON.stringify(action)}`, 0)

            // Forward agent actions to world
            send("WORLD", msg)

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
    this.reset()
    setInterval(() => {
      this.step()
      if (this.worlds.length > 0) {
        //TODO: uuid worlds for multiple, iterate through each to send 
        send("WORLD", JSON.stringify({ world: this }))
        // send("WORLD", JSON.stringify({ agents: this.agents, queue: this.queue }))
      }
    }, this.speed)
  }
}

module.exports = { World }