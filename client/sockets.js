const WS_URL = 'ws:///localhost:8888'
let ws = new WebSocket(WS_URL)
ws.onopen = () => {
    console.log(`Connected to ${WS_URL}`)
    ws.send("CLIENT")
}

ws.onmessage = async (message) => {
    if (typeof message.data === 'string') {
        console.log(message.data)
        document.getElementById("message").innerHTML = message.data
    }
}