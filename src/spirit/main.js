require('../functions')
const { AgentLand } = require('./umbra')

LOGGING = false

let amount = 10
let heaven = new AgentLand()

heaven.populate(amount)