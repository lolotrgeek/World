const WS_URL = 'ws:///localhost:8888'
let ws = new WebSocket(WS_URL)

ws.onopen = () => {
    console.log(`Connected to ${WS_URL}`)
    ws.send("WORLD")
}

function listen(callback) {
    ws.onmessage = async (message) => {
        if (typeof message.data === 'string') {
            callback(JSON.parse(message.data))
        }
    }
}