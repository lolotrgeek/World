require('./functions')
const WebSocket = require("ws")

const WS_PORT = 8888
const HTTP_PORT = 8000
const tag = "[Router]"

const wsServer = new WebSocket.Server({ port: WS_PORT }, () => log(`${tag} WS is listening at ${WS_PORT}`))

let clients = []

/**
 * 
 * @param {function} callback - do something with incoming message, 
 * returning a string from the callback will send that string as a reply to sender
 */
function listen(callback) {
    // send...
    wsServer.on("connection", (ws, req) => {
        ws.on("message", data => parseMessage(ws, data, callback))
        ws.on("error", error => log(`${tag} WebSocket error observed: ${error}`))
        // TODO: implement closed retries?
        ws.on("close", reason => log(`${tag} WebSocket Closed ${reason}`))
    })
}

/**
 * Give ws client a name then add to client list
 * @param {*} ws 
 */
function addClient(ws, data) {
    if (!ws.name) {
        let obj = getObject(data)
        ws.name = obj && obj.name ? obj.name : data
        clients.push(ws)
        log(`${tag} CLIENT "${ws.name}" CONNECTED`)
    }
}

function parseMessage(ws, data, callback) {
    if (typeof data === 'string') {
        addClient(ws, data)
        let msg = callback(data)
        reply(ws, msg)
    }
}

wsServer.broadcast = function broadcast(msg) {
    wsServer.clients.forEach(function each(client) {
        client.send(msg)
    })
}

function broadcast(msg) {
    wsServer.broadcast(msg)
}

function reply(ws, data) {
    if (typeof data === 'string') {
        ws.send(data)
    }
}

/**
 * 
 * @param {string} client name of client to send to
 * @param {*} data 
 */
function send(client, data) {
    clients.forEach((ws, i) => {
        if (clients[i] == ws && ws.readyState === 1) {
            if (ws.name === client) {
                log(`${tag} Sending: ${data}`, {show: 0})
                ws.send(typeof data === 'object' ? JSON.stringify(data) : data )
            }
        } else {
            log(`${tag} CLIENT ${i} DISCONNECTED`)
            clients.splice(i, 1)
        }
    })
}


module.exports = { listen, reply, broadcast, send }