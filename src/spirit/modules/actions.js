
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

module.exports = { Module, Select, Replicate }