
// Action Modules
// every action has an energy cost, 
// the cost will change depending on the environment 
// i.e. movemvent in a high friction envrionment costs more energy

// modules could be other creatures, with agents in them that can fit into the slot of this creature!

class Module {
    constructor() {
        this.params = 0
    }
}

/**
 * Look - Basic Initial Observation (input) Module (BIOM) 
 */
class Look extends Module {
    // look for nearby creatures
    constructor() {
        super()
    }
    spin(self) {
        // if look -> result is "nearby" creatures (state)
        // TODO: make this a NN that learns "attention".
        let nearby = self.observations.filter(observation => {
            if (observation.state.position.x <= self.state.visual_space && observation.state.position.y <= self.state.visual_space) {
                // console.log('Nearby:', observation.name)
                return true
            } else return false
        }).map(observation => observation.features) 

        // if(result.length > 0) console.log('Saw: ', result)
        return { observation: nearby }
    }
}

/**
 * Move - Basic Initial Action (output) Module (BIAM)
 */
class Move extends Module {
    constructor() {
        super()
        this.params = 2 // let agent know spin has two params (x, y)
        // params are an array of integers, here this.params lets the agent know the length of that array
    }
    spin(self) {
        // TODO: consider passing only needed vars, not entire self...
        // if move -> result is the new position (state) -> result updates position
        let position = self.state.position

        let x = self.action.params[0]
        let y = self.action.params[1]

        // console.log('Params: ', self.action.params)

        if (x > 0 || y > 0) {
            let vx = noise(-self.state.maxspeed, self.state.maxspeed)
            let vy = noise(-self.state.maxspeed, self.state.maxspeed)
            
            position = {x: self.state.position.x + x + vx, y: self.state.position.y + y + vy}
        }
        // if (position !== self.state.position) console.log('Moving: from', self.state.position, ' to', position)
        // else console.log('Same ', position)
        return { action: position }
    }
}

/**
 * Select - Basic Initial Transaction (output) Module (BATM)
 */
class Select extends Module {
    constructor() { 
        super()
        this.params = 1
    }

    spin(self) {
        let payment = self.action.params[0]
        // do not accept 0 or negative payments
        if(payment <= 0) return {selection : false}
        let others = self.state.nearby
        let threshold = 0.01
        // score others by attractiveness
        let potentials = others.map(other => {
            // determine attraction
            let attraction = Math.abs(self.features.attractions[0] - other.dna.genes[0])
            // console.log('Attraction', attraction)
            return {attraction, other}
        })
        let attractions = potentials.map(potential => potential.attraction).filter(attraction => attraction > threshold)
        // select the most attractive
        let selected = Array.max(attractions)
        let select = potentials.find(potential => potential.attraction === selected)
        let selection = select && select.other ? {mate: select.other, payment} : select
        // if(selection) console.log("Selection", selection)
        return { action: selection }
    }
}

class Eat extends Module {
    constructor() {
        super()
        this.params = 2
    }
    /**
     * this is only expressing the desire to eat another, the `world` has to resolve this transaction
     * @param {*} self 
     * @returns 
     */
    spin(self) {
        let chosen = self.action.params[0] // this is the index of the nearby creature
        let others = self.state.nearby
        if(!others || others.length <= 0 || typeof chosen !== 'number' || !others[chosen]) return {transaction : false}
        let amount = random(0, others[chosen].features.health)
        let eat = {take: amount, from: others[chosen]}
        return {transaction : eat}
    }
}

/**
 * Generates an Observation via a feedback mechanism using past observations (world model)
 */
class Simulate extends Module {
    constructor() {
        super()
    }
    spin(self) {
    }
}

module.exports = { Module, Look, Move, Select, Eat }