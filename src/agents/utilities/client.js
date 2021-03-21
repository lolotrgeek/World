const WebSocket = require("ws")

const WS_URL = 'ws:///localhost:8888'
let ws = new WebSocket(WS_URL)

/**
 * Let server know who is here.
 * @param {string} name 
 */
function register(name) {
    ws.onopen = () => {
        console.log(`Connected to ${WS_URL}`)
        ws.send(name)
    }
}

/**
 * Listen for responses from server.
 * @param {function} callback 
 */
function listen(callback) {
    ws.onmessage = async (message) => {
        if (typeof message.data === 'string') {
            callback(JSON.parse(message.data))
        }
    }
}

module.exports = { register, listen }