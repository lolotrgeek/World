let world_div = document.getElementById("world")
let count_div = document.getElementById("count")

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
    clear(count_div)
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
            if(msg.world.count) {
                count_div.appendChild(block(text(`step: ${msg.world.count}`)))
            }         
        }
        
    }
    else if (msg === "CLOSED") {
        stopsketch(world) // from sketch.js
    }
})



