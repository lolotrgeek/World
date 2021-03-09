
// consumes a state and chooses an action from a given action space
// this is a hardcoded agent, will later be replaced with a neural network.

class Agent {
    constructor(actions) {
        this.action_space = actions 
    }

    act (observation, reward, done) {
        if (observation.bloops && observation.bloops.length > 0) {
            // try to mate with nearby bloops...
            this.mate = this.actions.select(observation.bloops)
          }
          if (observation.foods && observation.foods.length > 0) {
            // EAT MODEL
            observation.foods.forEachRev(food => {
              let foodLocation = food[1]
              // try to eat the foods...
              if (this.inside(foodLocation)) {
                this.ate = this.actions.eat(food[0])
              }
            })
          }
        
          let vx = map(noise(this.xoff), 0, 1, -this.maxspeed, this.maxspeed)
          let vy = map(noise(this.yoff), 0, 1, -this.maxspeed, this.maxspeed)
          let coords = createVector(vx, vy)
          this.xoff += 0.01
          this.yoff += 0.01
          return coords
    }

    spin() {
        
    }
}
