
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

class Look extends Module {
    // look for nearby creatures
    constructor() {
        super()
    }
    spin(self) {
        // if look -> result is "nearby" creatures (state)
        // TODO: make this a NN that learns "attention".
        let result = self.observations.filter(observation => {
            if (observation.x <= self.state.visual_space && observation.y <= self.state.visual_space) {
                return true
            } else return false
        })

        // console.log('Saw: ', result)
        return { nearby: result }
    }
}

class Select extends Module {
    constructor() { super() }

    spin(self) {
        let others = params
        // select a mate by attractiveness
        let potentials = others.filter(other => {
            let attraction = Math.abs(self.attractions[0] - other.dna.genes[0])
            // ignore un-attractive...
            return attraction > self.fuzz ? true : false
        })
        // select the most attractive
        let selection = Array.max(potentials)
        return { 'selection': selection }
    }
}

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

        if (x > 0 || y > 0) {
            let vx = noise(-self.state.maxspeed, self.state.maxspeed)
            let vy = noise(-self.state.maxspeed, self.state.maxspeed)
            position.x = self.state.position.x + x + vx
            position.y = self.state.position.y + y + vy
            // console.log('Moving: from', self.state.position, ' to' , position)
        } 
        return { position }
    }
}
class Replicate extends Module {
    constructor() {
        super()
    }

    spin(self) {
        // if replicate -> result is copy of dna (state)
        // log('Replicating!')
        return self.dna.copy()
    }
}

module.exports = { Module, Look, Move, Replicate }