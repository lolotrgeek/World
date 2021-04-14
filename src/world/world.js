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
    this.generation = 0 // only tracks generation of creatures spawned by world
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
    bloop.features.generation = this.generation
    bloop.features.parent = 0
    bloop.features.id = this.bloops.length
    bloop.features.name = `${bloop.features.generation}_${bloop.features.parent}_${bloop.features.id}`
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
   * @param {string} name representing a creature's name
   * @returns `{index, creature}`
   */
  findCreature(name) {
    let found = { index: -1, creature: null }
    for (let i = 0; i < this.bloops.length; i++) {
      let bloop = this.bloops[i]
      if (bloop.features.name === name) {
        found.creature = bloop
        found.index = i
        
        break
      }
    }
    return found
  }

  /**
   * 
   * @param {string} name representing a creature's name
   * @returns `{index, creature}`
   */
  seekCreature(name) {
    let sought
    if (typeof name !== 'string' || name.length < 0) {
      log(`${tag} No name ${name}`)
      return { index: -1, creature: null }
    }
    
    log(`${tag} Seeking name ${name}`, 0)
    sought = this.findCreature(name)

    if (sought.index === -1) {
      log(`${tag} Name ${name} not found`, 1)
    }

    return sought
  }

  populate(agent, i) {
    // Spawn a population
    let initial_population = 5
    let threshold = 0
    if (this.energy > 0 && this.bloops.length < initial_population && this.queue.length > initial_population) threshold = this.odds
    if (threshold >= this.odds) {
      // Populate world if there are no creatures
      log(`${tag} Threshold passed! Spawning ${agent.name} / ${this.queue.length}`, 0)
      let bloop = this.addCreature(agent.name)
      let response = { creature: bloop, agent: agent.name }
      if (bloop) {
        this.addAgent(agent.name)
        this.queue.splice(i, 1)
      }
      send(agent.name, JSON.stringify(response))
      this.generation++
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
      this.populate(agent, i)
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
      else if (Date.now() - b.action.last_action > this.speed * 5) {
        send(b.agent, { dead: b })
        this.bloops.splice(i, 1)
        let agentIndex = this.agents.findIndex(agent => agent === b.agent)
        // console.log("Agent Back to Queue:", this.agents[agentIndex])
        this.agents.splice(agentIndex, 1)
        log(`${tag} Creature ${b.features.name} Died from No agent. Health: ${b.features.health} |  Actions: ${b.actions.length}`, 1)
        this.energy += b.features.health
      }
      // Check Nearly dead
      else if (Date.now() - b.action.last_action > this.speed * 3) {
        log(`${tag} Creature ${b.features.name} Nearly Dead! Health: ${b.features.health} | Actions: ${b.actions.length}`, 1)
        send(b.agent, { dying: b })
      }
      // Not Dead!
      else {
        // Handle State
        if (b.state) {
          if (b.state.selection && Object.keys(b.state.selection).length > 0) {
            log(`${tag} Reproducing: ${b.state.selection}`, 0)
            // selection {mate: {creature.features}, payment: {int}}

            let parent_dna = b.features.dna.copy()
            let child_dna = new DNA(parent_dna.mutate(.02))
            // Asexual - "nearby" is the trigger to reproduce, see Select() module

            if (this.queue.length > 0) {
              //randomly pick an agent from the queue
              let chosen = this.queue.length - 1
              let agent = this.queue[chosen]
              log(`${tag} chosen ${chosen} , agent ${JSON.stringify(agent)}`, 0)
              if (agent) {
                let divine_energy = randint(0, this.energy)
                this.energy -= divine_energy
                let health = divine_energy + b.state.selection.payment
                log(`${tag} Spawning Child : ${divine_energy}`, 0)
                let child = this.manifest(this.modulate(new Bloop(child_dna, health)))
                child.reset()
                child.features.generation = b.features.generation + 1
                child.features.parent = b.features.id
                child.features.id = this.bloops.length
                child.features.name = `${child.features.generation}_${child.features.parent}_${child.features.id}`
                log(`${tag} Reproducing: Parent ${b.features.name} spawned Child: ${child.features.name} | health ${child.features.health}`, 0)
                // conserve - paid health of parent into child health
                b.features.health -= b.state.selection.payment
                // modified addCreature sequence
                child.agent = agent.name
                let response = { creature: child, agent: agent.name }
                //Establish that an agent is ready to run creature, otherwise creature will die next step
                if (child) {
                  this.addAgent(agent.name)
                  this.queue.splice(chosen, 1)
                  send(agent.name, JSON.stringify(response))
                }
                this.bloops.push(child)
              }

              // check for child in bloops?
              // console.log(this.bloops.map(bloop => bloop.features.name))

              b.state.selection = null
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
          if (cost < 0) console.log(cost)
          b.spin(full_observation, cost)
          b.features.health -= cost
          this.energy += cost // "pay" world the cost of the action
          send(b.agent, { state: b.state })

          b.reset()
        }
        creature_energy += b.features.health
      }
    })
    if (this.energy + creature_energy > 1000) log(`${tag} Total : ${creature_energy + this.energy} | Available ${this.energy}`, 0)
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
          else if (obj.action && obj.action.choice > -1 && obj.action.params.length > -1) {
            
            let action = obj.action
            let found = this.seekCreature(obj.creature)
            // ISSUE: bloop could die before it gets assigned this action, which could result in wrong bloop being assigned action.
            // how to ensure correct bloop gets action being sent to it? -> make bloops autonomous (own process/port) -or- recheck bloop health and agent before assignment 
            let creature = this.bloops[found.index]
            if (creature && creature.features.health > 0 && creature.agent === obj.agent) {
              log(`${tag} Action assigment: ${creature.features.name} from ${creature.agent}`, 0)
              action.last_action = Date.now()
              creature.action = action
              creature.actions.push(action)
              send(obj.agent, { assigned: action })
            }
            else if (!creature || found.index === -1) {
              log(`${tag} Unfound Creature: ${creature}, at ${found.index}`, 1)
              //TODO: assume unfound creature is dead?
              send(obj.agent, { dead: {agent: obj.agent } })
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
      // if (this.bloops.length > 0) console.log(this.bloops.map(bloop => bloop.features.name))
      // if (this.agents.length > 0) console.log('agents' , this.agents)
      // if (this.queue.length > 0) console.log('queue', this.queue)
      if (this.worlds.length > 0) {
        //TODO: uuid worlds for multiple, iterate through each to send 
        send("WORLD", JSON.stringify({ world: this }))
        // send("WORLD", JSON.stringify({ agents: this.agents, queue: this.queue }))
      }
    }, this.speed)
  }
}

module.exports = { World }