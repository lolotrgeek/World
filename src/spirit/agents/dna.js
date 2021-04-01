// Evolution EcoSystem
// Daniel Shiffman <http://www.shiffman.net>

// Class to describe DNA
// Has more features for two parent mating (not used in this example)

// Constructor (makes a random DNA)

// dna -> genes
// essence -> basis
class DNA {
  constructor(newgenes) {
    if (newgenes) {
      this.genes = newgenes
    } else {
      // The genetic sequence
      // DNA is random floating point values between 0 and 1 (!!)
      // DNA determines size and speed
      this.genes = new Array(1);
      for (let i = 0; i < this.genes.length; i++) {
        this.genes[i] = Math.random()
      }
    }
  }

  copy() {
    // should switch to fancy JS array copy
    let newgenes = [];
    for (let i = 0; i < this.genes.length; i++) {
      newgenes[i] = this.genes[i]
    }

    return new DNA(newgenes)
  }

  /**
   * 
   * @param {Array} dna  an array of dna `[[genes], ...]`
   * @returns 
   */
  crossover(dna) {
    let genes = dna.flat()
    let choice = [genes[Math.floor(Math.random() * genes.length)]]
    return new DNA(choice)
  }

  // Based on a mutation probability, picks a new random character in array spots
  mutate(m) {
    this.genes.forEach((gene, i) => {
      if (Math.random() < m) {
        this.genes[i] = Math.random()
      }
    })
  }
}
module.exports = { DNA }