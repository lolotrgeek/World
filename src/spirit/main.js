require('../functions')
const { AgentLand } = require('./mind')

LOGGING = 'debug'

let amount = 10
let mind = new AgentLand()

mind.populate(amount)