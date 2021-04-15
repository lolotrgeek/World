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
    this.total = 0
    this.generation = 0 // only tracks generation of creatures spawned by world
    this.bloops = {}
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
    bloop.features.id = len(this.bloops)
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
      if (bloop.features.name) {
        this.conserve(health)
        bloop.agent = agent
        this.bloops[bloop.features.name] = bloop
        log(`${tag} Adding Creature ${bloop.features.name}`, 0)
        return bloop
      }
      else {
        log(`${tag} Invalid Creature ${JSON.stringify(bloop)}`, 1)
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

    log(`${tag} Seeking name ${name}`, 0)
    return { creature: this.bloops[name] }
  }

  populate(agent, i) {
    // Spawn a population
    let initial_population = 7
    // to spawn a single generation add this `this.generation < initial_population` to the following if statement
    if (this.energy > 0 && len(this.bloops) < initial_population && this.queue.length > 0) {
      // Populate world if there are no creatures
      log(`${tag} Threshold passed! Spawning ${agent.name} / ${this.generation}`, 0)
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
      log(`${tag} Agent Waiting, ${agent.name}`, 0)
      // Handle Disconnected Agents

      if (Date.now() - agent.time > this.speed * 2) {
        log(`${tag} Agent ${agent.name} in queue is dead.`, 0)
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
      log(`${tag} Creature ${b.features.name} Died from 0 Health. ${b.features.health}`, 1)
      return true
    }
    // Handle Death when no new action for this step...
    else if (Date.now() - b.action.last_action > this.speed * 5) {
      let agentIndex = this.agents.findIndex(agent => agent === b.agent)
      this.agents.splice(agentIndex, 1)
      if (b.features.health > 0.0) this.energy += b.features.health
      log(`${tag} Creature ${b.features.name} Died from No agent. Health: ${b.features.health} |  Actions: ${b.actions.length}`, 1)
      return true
    }
    // Check Nearly dead
    else if (Date.now() - b.action.last_action > this.speed * 3) {
      log(`${tag} Creature ${b.features.name} Nearly Dead! Health: ${b.features.health} | Actions: ${b.actions.length}`, 0)
      send(b.agent, { dying: b })
      return false
    }
    else return false
  }

  selectAgent(chosen) {
    if (this.queue.length > 0) {
      //randomly pick an agent from the queue
      let agent = this.queue[chosen]
      log(`${tag} chosen ${chosen} , agent ${JSON.stringify(agent)}`, 0)
      return agent
    }
    return false
  }

  addChild(b, child) {

  }

  spawnChild(b, energy) {
    // Asexual - "nearby" is the trigger to reproduce, see Select() module
    let parent_dna = b.features.dna.copy()
    let child_dna = new DNA(parent_dna.mutate(.02))
    let child = this.manifest(this.modulate(new Bloop(child_dna, energy)))
    child.reset()
    child.features.generation = b.features.generation + 1
    child.features.parent = b.features.id
    child.features.id = randint(0, len(this.bloops)) // TODO: make unique?
    child.features.name = `${child.features.generation}_${child.features.parent}_${child.features.id}`
    return child
  }

  reproduce(b) {
    // selection {mate: {creature.features}, payment: {int}}
    let child = false
    if (b.features.health > 1 && b.state.selection && Object.keys(b.state.selection).length > 0) {
      log(`${tag} Reproducing: ${JSON.stringify(b.state.selection)}`, 0)
      let chosen = this.queue.length - 1
      let agent = this.selectAgent(chosen)
      let health = randint(1, b.features.health) // test randomly selected health payment
      if (agent) {
        // let  = randint(0, this.energy)
        child = this.spawnChild(b, health)
        if (this.bloops[child.features.name]) {
          log(`${tag} Reproducing: Unable to Spawn, already exists ${child.features.name}`, 1)
          return false
        }
        child.agent = agent.name
        let response = { creature: child, agent: agent.name }
        if (child.features.health !== health) {
          log(`${tag} Reproducing: Unable to Spawn, energy mis-match ${health} !== ${child.features.health}`, 1)
        } else if (child && child.features.name) {
          this.addAgent(agent.name)
          this.queue.splice(chosen, 1)
          send(agent.name, JSON.stringify(response))
          this.bloops[child.features.name] = child
          if (child.features.health === health && this.bloops[child.features.name]) {
            log(`${tag} Reproducing: Parent ${b.features.name} spawned child: ${child.features.name} | health ${child.features.health}`, 1)
          } else {
            log(`${tag} Reproducing: Child Not added: ${child.features.name}`, 1)
          }
        }
        else {
          log(`${tag} Reproducing: Parent ${b.features.name} Unable to Spawn Child: `, 1)
        }
      }
      b.state.selection = null
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
    log(`${tag} Creature ${b.features.name} Action ${b.action.choice}`, 0)
    let cost = random(0, 1)
    if (cost > b.features.health) {
      // death blow - cost too high for health so it kills the creature
      this.energy += b.features.health
      b.features.health = 0
    }
    else if (cost <= b.features.health) {
      let full_observation = this.observation(b)
      b.spin(full_observation, cost)
      b.features.health -= cost
      this.energy += cost // "pay" world the cost of the action
      send(b.agent, { state: b.state })
    }
    b.reset()
  }

  /**
   * Test randomly killing a creature
   * @param {*} b 
   */
  kill(b) {
    let threshold = random(0, 1)
    if (threshold > 0.99) {
      log(`${tag} Randomly Killing ${b.features.name}`, 1)
      this.energy += b.features.health
      b.features.health = 0
    }
  }

  /**
   * Test floating costs with explict conservation
   * @param {*} b 
   */
  test(b) {
    let cost = random(0, 1)
    if (cost <= b.features.health) {
      // console.log(typeof cost, cost)
      let new_energy = this.energy + cost
      let new_health = b.features.health - cost
      b.features.health = new_health
      this.energy = new_energy
    }
  }

  balanceEnergy() {
    //TODO: can optimize by doing it in bloop for loop in step()
    let creature_energy = 0
    let creatures = Object.values(this.bloops)
    creatures.forEach(creature => {
      if (typeof creature.features.health === 'number' && creature.features.health > 0.0) {
        creature_energy += creature.features.health
      } else {
        console.log('Invalid Creature Energy', creature.features.health)
      }
    })
    this.total = this.energy + creature_energy
    if (Number.isNaN(this.total) || typeof this.total !== 'number') console.log('Total', typeof this.total, 'Creatures', creature_energy)
    if (Number.isNaN(this.energy) || typeof this.energy !== 'number') console.log('Energy', typeof this.energy)
    // Acceptable Error Threshold when dealing with floating energy costs
    if (this.total > 1000.1 || this.total < 999.9) log(`${tag} ERROR - Energy out of bounds! - this.total : ${this.total} | Available ${this.energy}`, 1)
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
        // Handle State
        if (b.state) {
          let child = this.reproduce(b)
          if (child && this.bloops[child.features.name]) {
            b.features.health -= child.features.health
          }
        }
        // Handle Actions
        if (b.action.choice > 0) {
          this.act(b)
        }
        // Handle Energy Conservation
        if (b.features.health < 0) {
          log(`${tag} WARNING - ${b.features.name} has negative health!`)
        }
      }
    }
    this.balanceEnergy()
  }

  handleAgent(obj) {
    // Handle new or returning Agent messages
    // agent message { name: string, time: number}
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
  handleAction(obj) {
    let action = obj.action
    let creature = null

    // let found = this.seekCreature(obj.creature)
    if (typeof obj.creature !== 'string') {
      log(`${tag} No name`)
    }

    log(`${tag} Seeking name ${obj.creature}`, 0)
    creature = this.bloops[obj.creature]

    if (creature && creature.agent === obj.agent) {
      log(`${tag} Action assigment: ${creature.features.name} from ${creature.agent}`, 0)
      action.last_action = Date.now()
      creature.action = action
      creature.actions.push(action)
      send(obj.agent, { assigned: action })
    }
    else if (!creature) {
      log(`${tag} Unfound Creature: ${obj.creature}`, 0)
      //TODO: assume unfound creature is dead?
      send(obj.agent, { dead: { agent: obj.agent } })
    }
    // modify message in the following...
    log(`${tag} Action: ${obj.creature} : ${JSON.stringify(action)}`, 0)
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