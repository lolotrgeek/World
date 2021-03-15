const WS_URL = 'ws:///localhost:8888'
let ws = new WebSocket(WS_URL)

let msg

ws.onopen = () => {
    console.log(`Connected to ${WS_URL}`)
    ws.send("WORLD")
}

ws.onmessage = async (message) => {
    if (typeof message.data === 'string') {
        msg = JSON.parse(message.data)
        // console.log(msg)
        redraw()
    }
}