require('../functions')
const { AgentLand } = require('./mind')

LOGGING = 'debug'

let amount = 10
let heaven = new AgentLand()

heaven.populate(amount)