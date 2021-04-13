require('./src/functions')
const path = require("path")
const express = require("express")
const cors = require('cors')
const app = express()
app.use(cors())

LOGGING = false
const HTTP_PORT = 8000
const tag = "[Server]"

function run() {
    app.use(express.static("."))
    app.get("/", (req, res) => res.sendFile(path.resolve(__dirname, "./src/client/world.html")))
    app.get("/functions.js", (req, res) => res.sendFile(path.resolve(__dirname, "./src/client/functions.js")))
    app.get("/index.js", (req, res) => res.sendFile(path.resolve(__dirname, "./src/client/index.js")))
    app.get("/sockets.js", (req, res) => res.sendFile(path.resolve(__dirname, "./src/client/sockets.js")))
    app.get("/sketch.js", (req, res) => res.sendFile(path.resolve(__dirname, "./src/client/sketch.js")))
    app.get("/world.js", (req, res) => res.sendFile(path.resolve(__dirname, "./src/client/world.js")))
    app.get("/reconnecting-websocket.js", (req, res) => res.sendFile(path.resolve(__dirname, "./node_modules/reconnecting-websocket/dist/reconnecting-websocket-iife.js")))
    app.listen(HTTP_PORT, () => log(`${tag} HTTP listening at ${HTTP_PORT}`))
}

module.exports = { run }
// run()
