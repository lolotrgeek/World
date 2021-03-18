
// Creature Action Space
// every action has an energy cost, 
// the cost will change depending on the environment 
// i.e. movemvent in a high friction envrionment costs more energy

class Actions {
    constructor() {}

    ping(self) {
        // look for nearby creatures
         
    }

    select(self, others) {
        // select a mate by attractiveness
        let potentials = others.filter(other => {
            let attraction = Math.abs(self.attractions[0] - other.dna.genes[0])
            // ignore un-attractive...
            return attraction > self.fuzz ? true : false
        })
        // select the most attractive
        let selection = Array.max(potentials)
        return selection
    }

    move(self, x, y) {
        
    }

    eat(self){

    }

    give(self, nearby) {
        // give energy to nearby
    }

    sexual_reproduce(self, mate) {
        let genes = self.dna.genes.concat(mate.dna.genes)
        let childDNA = self.dna.crossover(genes)
        return childDNA
    }

    asexual_reproduce(self) {
        let childDNA = null
        if (random(1) < 0.0005) childDNA = self.dna.copy()
        return childDNA
    }

}

module.exports = { Actions }