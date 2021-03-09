// run all services in single process
const path = require("path")
const express = require("express")
const WebSocket = require("ws")
const fs = require('fs')
const cors = require('cors')
const app = express()
app.use(cors())

const LOGGING = false
const WS_PORT = 8888
const HTTP_PORT = 8000

function log(msg) {
    if (LOGGING === true) {
        let entry = '\n' + `[${new Date().toLocaleString()}] - ${msg}`
        fs.appendFile('./logs/serverlog.txt', entry, (err) => {
            if (err) console.log(err);
        });
    } else {
        console.log(msg)
    }
}
const wsServer = new WebSocket.Server({ port: WS_PORT }, () => log(`WS Server is listening at ${WS_PORT}`))

let clients = []
let worlds = []

function run() {
    wsServer.on("connection", (ws, req) => {
        // log("Connected", req);

        ws.on("message", (data) => {
            if (typeof data === 'string') {
                // log('Data: '+ data)
                if (data === "CLIENT") {
                    addClient(ws)
                    setInterval(() => {
                        sendTo(`Hello! ${Date.now()}`, clients)
                    }, 1000)
                }
                else if (data === "WORLD") {
                    addWorld(ws)
                    setInterval(() => {
                        sendTo(`Hello! ${Date.now()}`, worlds)
                    }, 1000)
                }
                else {
                    sendTo(data, worlds)
                }
            }
        })

        ws.on("error", (error) => {
            log("WebSocket error observed: " + error);
        })
    })
    app.use(express.static("."))
    app.get("/", (req, res) => res.sendFile(path.resolve(__dirname, "./client/world.html")))
    app.get("/sockets.js", (req, res) => res.sendFile(path.resolve(__dirname, "./client/sockets.js")))
    app.get("/sketch.js", (req, res) => res.sendFile(path.resolve(__dirname, "./client/sketch.js")))
    app.listen(HTTP_PORT, () => log(`HTTP server listening at ${HTTP_PORT}`))    
}

wsServer.broadcast = function broadcast(msg) {
    wsServer.clients.forEach(function each(client) {
        client.send(msg)
    })
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

module.exports = {
    run: run
}