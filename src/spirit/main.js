require('../functions')
const { AgentLand } = require('./umbra')

LOGGING = false

let amount = 5
let heaven = new AgentLand()

heaven.populate(amount)