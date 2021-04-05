const WS = require('ws')
const ReconnectingWebSocket = require("reconnecting-websocket")

const tag = "[Client]"
const WS_URL = 'ws:///localhost:8888'
const options = {
    WebSocket: WS, // custom WebSocket constructor
    connectionTimeout: 1000,
    maxRetries: 10,
};
let ws = new ReconnectingWebSocket(WS_URL, [], options)

ws.on = (event, listener) => ws.addEventListener(event, listener)


ws.on('error', error => {
    log(`${tag} WebSocket error observed: ${error.message}`)
})

/**
 * Let server know who is here.
 * @param {object} name needs to have a name
 */
function register(name) {
    ws.on('open', function open() {
        console.log(`${tag} ${name} connected to ${WS_URL}`)
        ws.send(JSON.stringify({ name }))
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
    // TODO: implement closed retries?
    ws.on("close", reason => log(`${tag} WebSocket Closed ${reason}`))
}

/**
 * Send Data to Server
 * @param {object} data 
 */
function send(data) {
    if (ws.readyState === 1) ws.send(JSON.stringify(data))
}

module.exports = { register, listen, send }