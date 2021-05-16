let world_div = document.getElementById("world")

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


listen(msg => {
    if (typeof msg === 'object') {
        if (typeof msg.start === 'object') {
            world = createworld(msg.start) // from sketch.js
            startsketch(world)
        }

        if (typeof msg.world === 'object') {
            let particles = typeof msg.world.particles === 'object' ? Object.values(msg.world.particles) : null

            if (particles) {
                // update
                world.particles = particles
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



