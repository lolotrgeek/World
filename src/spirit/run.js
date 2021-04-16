require('../functions')
const { Agent } = require('./agents/random')
const { DNA } = require('./agents/dna')
const { v4: uuidv4 } = require('uuid')
LOGGING = 'debug'

let port = process.argv[3]
let agent

function manifest(agent) {
    // set initial state of agent
    if (!agent.state.address) agent.state.address = "ws://localhost:" + port
    if (!agent.state.world) agent.state.world = "ws://localhost:8888"
    if (!agent.state.rotations) agent.state.rotations = 0
    return agent
}

function modulate(agent) {
    // TODO: add modules
    return agent
}

function spawn() {
    agent = manifest(modulate(new Agent(new DNA())))
    agent.name = uuidv4()
}

spawn()
agent.spin()