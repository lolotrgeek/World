const WebSocket = require("ws")

const WS_URL = 'ws:///localhost:8888'
let ws = new WebSocket(WS_URL)

/**
 * Let server know who is here.
 * @param {string} name 
 */
function register(name) {
    ws.on('open', function open() {
        console.log(`Connected to ${WS_URL}`)
        ws.send(name)
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

module.exports = { register, listen }