const WS_URL = 'ws:///localhost:8888'
let ws = new WebSocket(WS_URL)

let msg

ws.onopen = () => {
    console.log(`Connected to ${WS_URL}`)
    ws.send("CLIENT")
}

ws.onmessage = async (message) => {
    if (typeof message.data === 'string') {
        console.log(message.data)
        msg = message.data
    }
}