const { PerformanceObserver, performance } = require('perf_hooks');
const http = require("http")
let time = performance.now()
const PORT = process.env.PORT || 5000
var _options = {
    host: "localhost",
    port: 7001,
    path: "/",
    method: 'POST',
    'content-type': 'application/json',
}
var socket = null

const net = require("net")
const net_Server = net.createServer()
net_Server.on("connection", sokt => {
    socket = sokt
    // console.log(JSON.stringify(socket)) //This won't work as active socket(meaning that it is not closed) is cirular in nature
    console.log("\n========= NEW CONNECTION =========")
    socket.write("This is the data from the server!") //But this message will only reach him once client's ready event has fired. But here ready event is never fired. Also client can still send the message even before his own ready event has actually fired.
    socket.on("error", (error) => {
        console.log("Error", error)
    })
    socket.on("close", () => {
        console.log("Socket has closed!")
        // console.log(socket)
        socket.destroy() //After the destruction , the socket changes to non circular json object, so we can stringify it
        console.log("After Destroy: ", JSON.stringify(socket))
        socket = null //Setting it to null opens the garbage collector to collect this socket and remove it?
        setTimeout(() => {
            if (!socket) { console.log("Socket is not defined") } //This will fire
            console.log("After SetTimeout: ", JSON.stringify(socket))
        }, 1000)
    })
    socket.on("open", () => {
        console.log("Socket is now open!") //This won't fire because we are not opening the sokcet?
    })
    socket.on("ready", () => { //This will also not fire don't know why . Maybe these are client depended event?
        console.log("Socket is ready!")
    })
    socket.on("data", (data) => {
        data = new Uint8Array(data)
        data = ConverArrayBufferToString(data)
        console.log("--Data Received: ", data)
    })
})
net_Server.listen(PORT, listeningListerner = () => {
    console.log("Port: ", PORT , "Socket Server Opened! \n")
})

function ConverArrayBufferToString(decrypted) {
    let string = ''
    for (let i = 0; i < decrypted.length; i++) {
        string += String.fromCharCode(decrypted[i])
    }
    return string
}
