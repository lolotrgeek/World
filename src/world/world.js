// A Proxy for Reality

const { Bloop } = require('./creatures/bloop')
const { Module, Look, Move, Select } = require('./modules/actions')
const { DNA } = require('./creatures/dna')

const { listen, broadcast, send } = require('../server')
const tag = "[World]"

class World {
  constructor(energy = 1000, odds = 0.005, size = { x: 500, y: 500 }) {
    // General Params
    this.speed = 100
    this.size = size
    this.odds = odds
    this.worlds = [] // list of connected "world" clients

    // Energy Params
    this.energy = energy
    this.total = 0
    this.error_ceiling = energy + 0.1 // max energy allowed to overflow
    this.error_floor = energy - 0.9 // min energy allowed to leak

    // Agent Params
    this.agents = []
    this.queue = [] // agents waiting for a creature to spawn
    this.agent_death = 3
    this.agent_dying = 2 // must be smaller than agent_death value

    // Creature Params
    this.bloops = {}
    this.initial_population = 7
    this.generation = 0 // only tracks generation of creatures spawned by world
    this.modules = [new Module(), new Select, new Look(), new Move()]
    this.mutation = .02
    this.observation_limit = 5
  }

  addAgent(agent) {
    this.agents.push(agent)
    log(`${tag} AGENT ADDED`, { show: false })
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
    if (!b.state.maxspeed) b.state.maxspeed = Math.map(b.features.dna.genes[0], 0, 1, 15, 0) // mapping size gene to set max speed
    if (!b.state.skin) b.state.skin = Math.map(b.features.dna.genes[0], 0, 1, 0, 50) // mapping size gene to set skin
    if (!b.state.visual_space) b.state.visual_space = b.state.skin * this.observation_limit
    if (!b.state.nearby) b.state.nearby = []
    if (!b.state.action.selection) b.state.action.selection = {}
    return b
  }

  modulate(b) {
    // attach modules to the creature
    if (this.modules.length <= b.slots) {
      b.modules = this.modules
      b.slots -= this.modules.length
    }
    //TODO: handle trying to attach too many modules
    return b
  }

  spawn(health, dna = new DNA()) {
    // set initial features of creature
    log(`${tag} Spawning : ${health}`, { show: false })
    let bloop = this.manifest(this.modulate(new Bloop(dna, health)))
    bloop.reset()
    bloop.features.generation = this.generation
    bloop.features.parent = 0
    bloop.features.id = len(this.bloops)
    bloop.features.name = `${bloop.features.generation}_${bloop.features.parent}_${bloop.features.id}`
    return bloop
  }

  distribute(energy) {
    return randint(1, energy)
  }

  conserve(energy) {
    this.energy -= energy
    log(`${tag} Conserving : ${energy} of ${this.energy}`, { show: false })

  }

  cost(action) {
    // TODO: factor environmental forces and tasks into cost
    let cost = random(0, 1)
    this.energy += cost
    return cost
  }

  addCreature(agent) {
    if (this.energy > 0) {
      let health = randint(1, this.energy)
      let bloop = this.spawn(health)
      if (bloop.features.name) {
        this.conserve(health)
        bloop.agent = agent
        this.bloops[bloop.features.name] = bloop
        log(`${tag} Adding Creature ${bloop.features.name}`, { show: false })
        return bloop
      }
      else {
        log(`${tag} Invalid Creature ${JSON.stringify(bloop)}`)
        return null
      }
    }
    else return null
  }

  /**
   * 
   * @param {string} name representing a creature's name
   * @returns `{creature}`
   */
  seekCreature(name) {
    if (typeof name !== 'string' || name.length < 0) {
      log(`${tag} No name ${name}`)
      return { creature: null }
    }

    log(`${tag} Seeking name ${name}`, { show: false })
    return { creature: this.bloops[name] }
  }

  populate(agent, i) {
    // Spawn a population
    // to spawn a single generation add this `this.generation < this.initial_population` to the following if statement
    if (this.energy > 0 && len(this.bloops) < this.initial_population && this.queue.length > 0) {
      // Populate world if there are no creatures
      log(`${tag} Threshold passed! Spawning ${agent.name} / ${this.generation}`, { show: false })
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

  waiting() {
    // check for agents waiting for a creature
    this.queue.forEachRev((agent, i) => {
      log(`${tag} Agent Waiting, ${agent.name}`, { show: false })
      // Handle Disconnected Agents

      if (Date.now() - agent.time > this.speed * this.agent_death) {
        log(`${tag} Agent ${agent.name} in queue is dead.`, { show: false })
        this.queue.splice(i, 1)
      }
      this.populate(agent, i)
    })
  }

  dead(b) {
    // Handle Death from natural causes
    if (b.features.health <= 0.0) {
      let agentIndex = this.agents.findIndex(agent => agent === b.agent)
      // console.log("Agent Back to Queue:", this.agents[agentIndex])
      this.agents.splice(agentIndex, 1)
      log(`${tag} Creature ${b.features.name} Died from 0 Health. ${b.features.health}`)
      return true
    }
    // Handle Death when no new action for this step...
    else if (Date.now() - b.action.last_action > this.speed * this.agent_death) {
      let agentIndex = this.agents.findIndex(agent => agent === b.agent)
      this.agents.splice(agentIndex, 1)
      if (b.features.health > 0.0) this.energy += b.features.health
      log(`${tag} Creature ${b.features.name} Died from No agent. Health: ${b.features.health} |  Actions: ${b.actions.length}`)
      return true
    }
    // Check Nearly dead
    else if (b.features.health < this.agent_dying || Date.now() - b.action.last_action > this.speed * this.agent_dying) {
      // NOTE: "food" creation happens when a creature is abandoned since it's energy can easily be taken.
      log(`${tag} Creature ${b.features.name} Nearly Dead! Health: ${b.features.health} | Actions: ${b.actions.length}`, { show: false })
      send(b.agent, { dying: b })
      return false
    }
    else return false
  }

  selectAgent(chosen) {
    if (this.queue.length > 0) {
      let agent = this.queue[chosen]
      log(`${tag} chosen ${chosen} , agent ${JSON.stringify(agent)}`, { show: false })
      return agent
    }
    return false
  }

  spawnChild(b, energy) {
    // Asexual - "nearby" is the trigger to reproduce, see Select() module
    let parent_dna = b.features.dna.copy()
    let child_dna = new DNA(parent_dna.mutate(this.mutation))
    let child = this.manifest(this.modulate(new Bloop(child_dna, energy)))
    child.reset()
    child.features.generation = b.features.generation + 1
    child.features.parent = b.features.id
    child.features.id = randint(0, len(this.bloops)) // TODO: make unique?
    child.features.name = `${child.features.generation}_${child.features.parent}_${child.features.id}`
    return child
  }

  /**
   * Convert a stateful selection into a Creature with agency.
   * @ref `selection {mate: {creature.features}, payment: {int}}`
   * @param {*} b 
   * @returns 
   */
  reproduce(b) {
    let child = false
    if (b.features.health > 1 && b.state.action.selection && Object.keys(b.state.action.selection).length > 0) {

      log(`${tag} Reproducing: ${JSON.stringify(b.state.action.selection)}`, { show: false })
      let chosen = this.queue.length - 1 // TODO: choose agent based on different critera?
      let agent = this.selectAgent(chosen)
      let health = randint(1, b.features.health) // TODO: move to divine energy model?

      if (agent) {
        child = this.spawnChild(b, health)
        if (this.bloops[child.features.name]) {
          log(`${tag} Reproducing: Unable to Spawn, already exists ${child.features.name}`)
          return false
        }
        child.agent = agent.name
        let response = { creature: child, agent: agent.name }
        if (child.features.health !== health) {
          log(`${tag} Reproducing: Unable to Spawn, energy mis-match ${health} !== ${child.features.health}`)
        } else if (child && child.features.name) {
          this.addAgent(agent.name)
          this.queue.splice(chosen, 1)
          send(agent.name, JSON.stringify(response))
          this.bloops[child.features.name] = child
          if (child.features.health === health && this.bloops[child.features.name]) {
            log(`${tag} Reproducing: Parent ${b.features.name} spawned child: ${child.features.name} | health ${child.features.health}`)
          } else {
            log(`${tag} Reproducing: Child Not added: ${child.features.name}`)
          }
        }
        else {
          log(`${tag} Reproducing: Parent ${b.features.name} Unable to Spawn Child: `)
        }
      }
      b.state.action.selection = null
      return child
    }
  }

  observation(b) {
    // OPTIMIZE: could this be faster?
    // let full_state = clone(this.bloops)
    // delete full_state[b.features.name] // remove self from observation
    // let full_observation = Object.values(full_state)

    let full_observation = Object.values(this.bloops)
    return full_observation.filter(bloop => bloop.features.name !== b.features.name) // filter self from observation
  }

  /**
   * Perform action, send observation 
   * @param {*} b creature class
   * @param {Object} b.action `{ choice: int, params: [], last_action: int }`  
   */
  act(b) {
    log(`${tag} Creature ${b.features.name} Action ${b.action.choice}`, { show: false })
    let cost = random(0, 1) // TODO: environmental factors for cost, task based
    if (cost > b.features.health) {
      // death blow - cost too high for health so it kills the creature
      this.energy += b.features.health
      b.features.health = 0
    }
    else if (cost <= b.features.health) {
      let full_observation = this.observation(b)
      b.spin(full_observation, cost) // performs the action
      b.features.health -= cost
      this.energy += cost // "pay" world the cost of the action
      send(b.agent, { state: b.state })
    }
    b.reset()
  }

  transact(b) {
    if (typeof b.state == 'object' && typeof b.state.transaction === 'object') {
      let success = randint(-1, 1) // TODO: parameterize
      // Handle a Take Transaction

      // TODO: does transaction require locality? -> double check nearby, fail if not

      if (b.state.transaction.take) {
        let chosen = b.state.transaction.from.features.name
        b.state.transaction
        if (success > 0) {
          // if success, then deduct from recipient add to current
          this.bloops[chosen].features.health -= b.state.transaction.take
          b.features.health += b.state.transaction.take
        }
          // if failure, do nothing...

      // Handle a give Transaction
      } else if (b.state.transaction.give) {
        let chosen = b.state.transaction.from.features.name
        b.state.transaction
        if (success > 0) {
          // if success, then deduct from current add to recipient
          this.bloops[chosen].features.health += b.state.transaction.take
          b.features.health -= b.state.transaction.take
        }
          // if failure, do nothing...   
      }
      send(b.agent, { state: b.state })
    }
  }

  /**
   * Randomly kill a creature
   * @param {*} b 
   */
  kill(b) {
    let threshold = random(0, 1)
    if (threshold > 0.99) {
      log(`${tag} Randomly Killing ${b.features.name}`)
      this.energy += b.features.health
      b.features.health = 0
    }
  }

  /**
   * Test floating costs with explict conservation
   * @param {*} b 
   */
  testCost(b) {
    let cost = random(0, 1)
    if (cost <= b.features.health) {
      // console.log(typeof cost, cost)
      let new_energy = this.energy + cost
      let new_health = b.features.health - cost
      b.features.health = new_health
      this.energy = new_energy
    }
  }

  /**
   * Check Total energy in system by checking creature health and available energy against acceptable error bounds
   */
  checkEnergy() {
    //TODO: can optimize by doing it in bloop for loop in step()
    let creature_energy = 0
    let creatures = Object.values(this.bloops)
    creatures.forEach(creature => {
      if (typeof creature.features.health === 'number' && creature.features.health > 0.0) {
        creature_energy += creature.features.health
      } else {
        log(`Invalid Creature Energy, ${creature.features.health}`, { show: false })
      }
    })
    this.total = this.energy + creature_energy
    if (Number.isNaN(this.total) || typeof this.total !== 'number') console.log('Total', typeof this.total, 'Creatures', creature_energy)
    if (Number.isNaN(this.energy) || typeof this.energy !== 'number') console.log('Energy', typeof this.energy)
    // Acceptable Error Threshold when dealing with floating energy costs
    if (this.total > this.error_ceiling || this.total < this.error_floor) log(`${tag} ERROR - Energy out of bounds! - this.total : ${this.total} | Available ${this.energy}`)
  }

  step() {
    this.waiting()
    for (let bloop_name in this.bloops) {
      let b = this.bloops[bloop_name]
      // this.kill(b)
      let death = this.dead(b)
      if (death === true) {
        send(b.agent, { dead: b })
        delete this.bloops[bloop_name]
      }
      else {
        // Handle Stateful Observations
        if (b.state.observation) {
          let child = this.reproduce(b)
          if (child && this.bloops[child.features.name]) {
            b.features.health -= child.features.health // TODO: move this into reproduce() ?
          }
        }
        // Handle Actions
        if (b.action.choice > 0) {
          this.act(b)
        }
        if (b.state.transaction) {
          this.transact(b)
        }
        // Handle Energy Conservation
        if (b.features.health < 0) {
          log(`${tag} WARNING - ${b.features.name} has negative health!`)
        }
      }
    }
    this.checkEnergy()
  }

  handleAgent(obj) {
    // Handle new or returning Agent messages
    // agent message { name: string, time: number}
    let inAgents = this.agents.find(agent => agent === obj.name)
    let queued = this.queue.findIndex(agent => agent.name === obj.name)
    let inQueue = queued > -1
    if (!inAgents && !inQueue) {
      log(`${tag} Adding agent ${obj.name} to queue.`, { show: false })
      this.queue.push(obj)
    } else if (!inAgents && inQueue) {
      log(`${tag} Updating agent ${obj.name} in queue.`, { show: false })
      this.queue[queued] = obj
    }
  }

  // Handle Actions messages
  // action message { action: {choice: int, params: []}, agent: string, creature: number }
  handleAction(obj) {
    let action = obj.action
    let creature = null

    // let found = this.seekCreature(obj.creature)
    if (typeof obj.creature !== 'string') {
      log(`${tag} No name`)
    }

    log(`${tag} Seeking name ${obj.creature}`, { show: false })
    creature = this.bloops[obj.creature]

    if (creature && creature.agent === obj.agent) {
      log(`${tag} Action assigment: ${creature.features.name} from ${creature.agent}`, { show: false })
      action.last_action = Date.now()
      creature.action = action
      creature.actions.push(action)
      send(obj.agent, { assigned: action })
    }
    else if (!creature) {
      log(`${tag} Unfound Creature: ${obj.creature}`, { show: false })
      //TODO: assume unfound creature is dead?
      send(obj.agent, { dead: { agent: obj.agent } })
    }
    // modify message in the following...
    log(`${tag} Action: ${obj.creature} : ${JSON.stringify(action)}`, { show: false })
  }

  reset() {
    listen(msg => {
      // listen for world renderers
      if (msg === "WORLD") {
        this.addWorld("WORLD") // TODO: add uuid for worlds and live reloading
        return JSON.stringify({ start: { bloops: Object.values(this.bloops), energy: this.energy } })
      }
      // listen for agent messages
      else {
        let obj = getObject(msg)
        if (obj) {
          if (obj.name) this.handleAgent(obj)
          else if (obj.action && obj.action.choice > -1 && obj.action.params.length > -1) {
            this.handleAction(obj)
            // Forward agent actions to world
            send("WORLD", msg)
          }
        }
        // handle unknown objects
        else {
          log(`${tag} Unknown: ${JSON.stringify(obj)}`)
        }
      }
    })
  }

  spin() {
    this.reset()
    setInterval(() => {
      this.step()
      // if (len(this.bloops) > 0) console.log(this.bloops.map(bloop => bloop.features.name))
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