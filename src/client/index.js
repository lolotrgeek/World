let agents_div = document.getElementById("agents")
let agents_online_div = document.getElementById("online")
let agents_waiting_div = document.getElementById("waiting")
let agents_online_headers = document.getElementById("online-column-headers")
let agents_waiting_headers = document.getElementById("waiting-column-headers")

let creatures_div = document.getElementById("creatures")
let creatures_headers = document.getElementById("creature-column-headers")
let creatures_alive = document.getElementById("creature")

let world_div = document.getElementById("world")
let world_stats_div = document.getElementById("world-stats")

let world

let cnv

function clear(element) {
    element.innerHTML = null
    return element
}

function block(child) {
    let element = document.createElement("div")
    if (child) element.appendChild(child)
    return element
}

function text(value) {
    let element = document.createElement("span")
    element.innerText = value
    return element
}

function title(value) {
    let element = document.createElement("h2")
    element.innerText = value
    return element
}

function heading(value) {
    let element = document.createElement("b")
    element.innerText = value
    return element
}
function subheading(value) {
    let element = document.createElement("em")
    element.innerText = value
    return element
}

world_div.prepend(block(title("World")))

creatures_div.prepend(block(title("Creatures")))
creatures_headers.appendChild(block(heading(`Name`)))
creatures_headers.appendChild(block(heading(`Health`)))
creatures_headers.appendChild(block(heading(`X`)))
creatures_headers.appendChild(block(heading(`Y`)))

agents_div.prepend(block(title("Agents")))
// agents headers
agents_online_headers.appendChild(block(heading(`Agent`)))
agents_online_headers.appendChild(block(heading(`Name`)))
agents_online_headers.appendChild(block(heading(`Action`)))
agents_online_headers.appendChild(block(heading(`Last Action`)))

// agents sub headers
agents_online_headers.appendChild(block(subheading(``)))
agents_online_headers.appendChild(block(subheading(`(Generation_Parent_Id)`)))
agents_online_headers.appendChild(block(subheading(``)))
agents_online_headers.appendChild(block(subheading(``)))



listen(msg => {
    if (typeof msg === 'object') {

        if (typeof msg.start === 'object') {
            world = createworld(msg.start) // from sketch.js
            startsketch(world)
        }

        if (typeof msg.world === 'object') {
            let bloops = typeof msg.world.bloops === 'object' ? Object.values(msg.world.bloops) : null

            if (bloops) {                
                // update creatures
                world.bloops = bloops
                clear(creatures_alive)
                world.bloops.map(bloop => {
                    creatures_alive.appendChild(block(text(`${bloop.features.name}`)))
                    creatures_alive.appendChild(block(text(`${bloop.features.health}`)))
                    creatures_alive.appendChild(block(text(`${Math.round(bloop.state.position.x)}`)))
                    creatures_alive.appendChild(block(text(`${Math.round(bloop.state.position.y)}`)))
                })

            }
            if (Array.isArray(msg.world.agents)) {
                // update agents
                world.agents = msg.world.agents
                clear(agents_online_div)
                world.agents.map(agent => {
                    // match agent and creature
                    let found = world.bloops.findIndex(creature => creature.agent === agent)
                    if (found > -1) {
                        agents_online_div.appendChild(block(text(`${agent}`)))
                        agents_online_div.appendChild(block(text(`${world.bloops[found].features.name}`)))
                        agents_online_div.appendChild(block(text(`${world.bloops[found].action.choice}`)))
                        agents_online_div.appendChild(block(text(`${world.bloops[found].action.last_action}`)))
                    }
                })

            }
            if (Array.isArray(msg.world.queue)) {
                world.queue = msg.world.queue
                clear(agents_waiting_div)
                world.queue.map(agent => {
                    agents_waiting_div.appendChild(block(text(`${agent.name}`)))
                    agents_waiting_div.appendChild(block(text(``)))
                    agents_waiting_div.appendChild(block(text(``)))
                    agents_waiting_div.appendChild(block(text(``)))
                })
            }
            if(typeof msg.world.energy === 'number') {
                clear(world_stats_div)
                world_stats_div.appendChild(block(text(`Available Energy : ${msg.world.energy}`)))
                world_stats_div.appendChild(block(text(`Total Energy : ${msg.world.total}`)))
            }            
        }
        else if (msg.action) {
            // Agent Actions
        }
        total_energy = []
    }
    else if (msg === "CLOSED") {
        stopsketch(world) // from sketch.js
    }
})



