let agentdiv = document.getElementById("agents")
let creaturediv = document.getElementById("creatures")
let world 

let agents = []
let creatures = []

listen(msg => {
    if (Array.isArray(msg)) {
        // update creatures
        world.bloops = msg
        creatures = msg
        creaturediv.innerText = "Creatures:" + JSON.stringify(msg)
        
    }
    else if(typeof msg === 'object' && msg.agent) {
        agentdiv.innerText = "Agents" + JSON.stringify(agents)
        let found = agents.findIndex(agent => agent.agent === msg.agent)
        if(found > -1) agents.splice(found, 1)
        agents.push(msg)
    }
    else if (typeof msg === 'object' && typeof msg.world === 'object') {
        world = createworld(msg) // from sketch.js
        startsketch(world)
    }
    else if (msg === "CLOSED") {
      stopsketch(world) // from sketch.js
    }
  })