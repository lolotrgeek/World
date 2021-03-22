const path = require("path")
const express = require("express")
const WebSocket = require("ws")
const cors = require('cors')
const app = express()
app.use(cors())

const WS_PORT = 8888
const HTTP_PORT = 8000

const wsServer = new WebSocket.Server({ port: WS_PORT }, () => log(`WS Server is listening at ${WS_PORT}`))

let clients = []

/**
 * 
 * @param {function} callback - do something with incoming message, 
 * returning a string from the callback will send that string as a reply to sender
 */
function listen(callback) {
    // send...
    wsServer.on("connection", (ws, req) => {
        ws.on("message", (data) => parseMessage(ws, data, callback))
        ws.on("error", (error) => log("WebSocket error observed: " + error))
    })
}

function parseMessage(ws, data, callback) {
    if (typeof data === 'string') {
        clients.push(ws)
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
    if(typeof data === 'string') {
        ws.send(data)
    }
}

/**
 * 
 * @param {*} data 
 */
function send(data) {
    clients.forEach((ws, i) => {
        if (clients[i] == ws && ws.readyState === 1) {
            log(data)
            ws.send(data)
        } else {
            log(`CLIENT ${i} DISCONNECTED`)
            clients.splice(i, 1)
        }
    })
}

function run() {
    app.use(express.static("."))
    app.get("/", (req, res) => res.sendFile(path.resolve(__dirname, "./world/client/world.html")))
    app.get("/functions.js", (req, res) => res.sendFile(path.resolve(__dirname, "./world/client/functions.js")))
    app.get("/sockets.js", (req, res) => res.sendFile(path.resolve(__dirname, "./world/client/sockets.js")))
    app.get("/sketch.js", (req, res) => res.sendFile(path.resolve(__dirname, "./world/client/sketch.js")))
    app.get("/world.js", (req, res) => res.sendFile(path.resolve(__dirname, "./world/client/world.js")))
    app.listen(HTTP_PORT, () => log(`HTTP server listening at ${HTTP_PORT}`))
}

module.exports = { run, listen, reply, broadcast, send }