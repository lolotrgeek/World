const WebSocket = require("ws")

const WS_URL = 'ws:///localhost:8888'
let ws = new WebSocket(WS_URL)

/**
 * Let server know who is here.
 * @param {object} name needs to have a name
 */
function register(name) {
    ws.on('open', function open() {
        console.log(`Connected to ${WS_URL}`)
        ws.send(JSON.stringify({name}))
    })
}

/**
 * Listen for responses from server.
 * @param {function} callback 
 */
function listen(callback) {
    ws.on('message', function incoming(data) {
        if (typeof data === 'string') {
            callback(JSON.parse(data))
        }
    })
}


/**
 * Send Data to Server
 * @param {object} data 
 */
function send(data) {
    if (ws.readyState === 1) ws.send(JSON.stringify(data))
}

module.exports = { register, listen, send }