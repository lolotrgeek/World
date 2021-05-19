let world_div = document.getElementById("world")
let step_div = document.getElementById("steps")
let total_div = document.getElementById("total")
let negative_div = document.getElementById("negative")
let positive_div = document.getElementById("positive")
let neutral_div = document.getElementById("neutral")

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
                total_div.innerText = `particles: ${particles.length}`
            }
            // if (msg.world.count) {
            //     negative_div.innerText = `negative: ${msg.world.count.negative}`
            //     positive_div.innerText = `positive: ${msg.world.count.positive}`
            //     neutral_div.innerText = `neutral: ${msg.world.count.neutral}`
            // }
            if (msg.world.steps) {
                step_div.innerText = `step: ${msg.world.steps}`
            }
        }

    }
    else if (msg === "CLOSED") {
        stopsketch(world) // from sketch.js
    }
    // clear(step_div)
    // clear(particle_count_div)
})



