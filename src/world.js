// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Evolution EcoSystem

const { Bloop } = require('./creatures/bloop')
const { DNA } = require('./creatures/dna')
const { run, listen, broadcast } = require('./server')

class World {
  constructor(energy) {
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

  spawn(health) {
    console.log('Spawning:', health)
    let dna = new DNA()
    let bloop = new Bloop(dna, health)
    bloop.address = "ws://localhost:" + this.port()
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

  update() {
    // listening for bloop's states and sending to other bloops and sketch
    this.bloops.forEachRev((b, i) => {
      b.spin()

      // pass the bloop an observation
      // b.observe(nearby)

      if (b.ate != null) {
        // this.energy.remove(b.ate)
      }

      // has bloop selected a mate?
      if (b.mate && random(1) < odds) {
        let childDNA = b.actions.reproduce(b.mate)
        if (childDNA != null) {
          // TODO: parent give energy to child...
          childDNA.mutate(0.01)
          // let child = new Bloop(childDNA)
          this.bloops.push(child) // TODO: send this over websocket
        }
      }
      if (b.dead()) {
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
    this.update()
    listen(msg => {
      if(msg === "WORLD") {
        console.log(JSON.stringify({world: this}))
        return JSON.stringify({world: this})
      }
      else if (Array.isArray(msg) && msg.length > 0) {
        this.bloops = msg.map(heard => {
          let bloop = new Bloop(heard.dna, heard.health)
          bloop.actions = heard.actions
          bloop.position = heard.position
          bloop.attractions = heard.attractions
          bloop.phenotype = heard.phenotype
          bloop.observations = heard.observations
          return bloop
        })
      }
      // console.log(bloops)
      this.update()
    })
  }
}

module.exports = { World }