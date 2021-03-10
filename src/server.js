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
let worlds = []

function run() {
    server()
    // send...
    wsServer.on("connection", (ws, req) => {
        ws.on("message", (data) => parseMessage(ws, data))
        ws.on("error", (error) => log("WebSocket error observed: " + error))
    })
}

wsServer.broadcast = function broadcast(msg) {
    wsServer.clients.forEach(function each(client) {
        client.send(msg)
    })
}

function broadcast(msg) {
    wsServer.broadcast(msg)
}

function parseMessage(ws, data) {
    if (typeof data === 'string') {
        // log('Data: '+ data)
        if (data === "CLIENT") {
            addClient(ws)
        }
        else if (data === "WORLD") {
            addWorld(ws)
        }
        else {
            log(data)
            // sendTo(data, worlds)
        }
    }
}

function addClient(ws) {
    clients.push(ws)
    log("CLIENT ADDED")
    return
}

function addWorld(ws) {
    worlds.push(ws)
    log("WORLD ADDED")
    return
}

function sendTo(data, list) {
    list.forEach((ws, i) => {
        if (list[i] == ws && ws.readyState === 1) {
            log(data)
            ws.send(data)
        } else {
            log(`CLIENT ${i} DISCONNECTED`)
            list.splice(i, 1)
        }
    })
}

function server() {
    app.use(express.static("."))
    app.get("/", (req, res) => res.sendFile(path.resolve(__dirname, "./client/world.html")))
    app.get("/functions.js", (req, res) => res.sendFile(path.resolve(__dirname, "./client/functions.js")))
    app.get("/sockets.js", (req, res) => res.sendFile(path.resolve(__dirname, "./client/sockets.js")))
    app.get("/sketch.js", (req, res) => res.sendFile(path.resolve(__dirname, "./client/sketch.js")))
    app.get("/world.js", (req, res) => res.sendFile(path.resolve(__dirname, "./client/world.js")))
    app.listen(HTTP_PORT, () => log(`HTTP server listening at ${HTTP_PORT}`))
}

module.exports = { run, broadcast }