const http = require('http');
const crypto = require('crypto');
const fs = require('fs')
const pathToHTML = "tml"
const pathToJS = "ome/mys"

const server = http.createServer((req, res) => {
   
    console.log(req.url)
    if (req.url == "/") {
        res.writeHead(200, {
            "content-type": "text/html"
        })
        res.write(file)
        res.end()
    } else {
        res.writeHead(404, {
            "stats": "error"
        })
        res.end()
    }
});


const port = process.env.PORT
server.listen(port, () => console.log(`Server running at Port:${port}`));


server.on("upgrade", Upgrade)
function Upgrade(req, socket) {
    if (req.headers['upgrade'] !== 'websocket') {
        socket.end('HTTP/1.1 400 Bad Request');
        return;
    }

    const acceptKey = req.headers['sec-websocket-key'];
    const hash = generateAcceptValue(acceptKey);
    const responseHeaders = ['HTTP/1.1 101 Web Socket Protocol Handshake', 'Upgrade: WebSocket', 'Connection: Upgrade', `Sec-WebSocket-Accept: ${hash}`];
    // Write the response back to the client socket, being sure to append two
    // additional newlines so that the browser recognises the end of the response
    // header and doesn't continue to wait for more header data:
    // Read the subprotocol from the client request headers:


    const protocol = req.headers['sec-websocket-protocol'];
    // If provided, they'll be formatted as a comma-delimited string of protocol
    // names that the client supports; we'll need to parse the header value, if
    // provided, and see what options the client is offering:
    const protocols = !protocol ? [] : protocol.split(',').map(s => s.trim());
    if (protocols.includes('json')) {
        responseHeaders.push(`Sec-WebSocket-Protocol: json`);
    }

    socket.write(responseHeaders.join('\r\n') + '\r\n\r\n');

    socket.on("close", () => {
        console.log('Socket closed')
        socket.close()
    })
    socket.on("error", (error) => {
        console.log(error)
    })
    socket.on('data', async (buffer) => {
        const message = await parseMessage(buffer);
        if (message) {
            // console.log("Message From Client", message);
            let messageToSendToClient = await constructReply({ message: `Message From The Server: ${message.toString().substring(0, 30)} ; LastChar: ${message.toString()[message.length - 1]}` });
            socket.write(messageToSendToClient)
        } else if (message === null) {
            console.log('WebSocket connection closed by the client.');
        }
    });
    async function constructReply(data) {
        // Convert the data to JSON and copy it into a buffer
        const json = JSON.stringify(data)
        const jsonByteLength = Buffer.byteLength(json);
        // Note: we're not supporting > 65535 byte payloads at this stage
        const lengthByteCount = jsonByteLength < 126 ? 0 : 2;
        const payloadLength = lengthByteCount === 0 ? jsonByteLength : 126;
        const buffer = Buffer.alloc(2 + lengthByteCount + jsonByteLength);
        // Write out the first byte, using opcode `1` to indicate that the message
        // payload contains text data
        buffer.writeUInt8(0b10000001, 0);
        buffer.writeUInt8(payloadLength, 1);
        // Write the length of the JSON payload to the second byte
        let payloadOffset = 2;
        if (lengthByteCount > 0) {
            buffer.writeUInt16BE(jsonByteLength, 2); payloadOffset += lengthByteCount;
        }
        // Write the JSON data to the data buffer
        buffer.write(json, payloadOffset);
        return buffer;
    }
    async function parseMessage(buffer) {
        let bufferFullLength  = buffer.byteLength
        // console.log("Byte Length Of The Whole Message: ", bufferFullLength)
        const firstByte = buffer.readUInt8(0); //It is actaully a number
        // console.log(Boolean(firstByte >>> 7)) //This also works so no need for anding it
        const isFinalFrame = Boolean((firstByte >>> 7) & 0x1);
        const [reserved1, reserved2, reserved3] = [Boolean((firstByte >>> 6) & 0x1), Boolean((firstByte >>> 5) & 0x1), Boolean((firstByte >>> 4) & 0x1)];
        const opCode = firstByte & 0xF;
        // // We can return null to signify that this is a connection termination frame
        // if (opCode == "0×8")
        //     return null;
        // // We only care about text frames from this point onward
        // if (opCode != "0×1")
        //     return;
        const secondByte = buffer.readUInt8(1);
        const isMasked = Boolean((secondByte >>> 7) & 0x1);

        // console.log("firstByte", firstByte, "isFinalFrame" , isFinalFrame, "opCode", opCode, "secondByte", secondByte, "isMasked" , isMasked)

        // Keep track of our current position as we advance through the buffer
        let currentOffset = null
        currentOffset = 2; let payloadLength = secondByte & 0x7F;
        if (payloadLength > 125) {
            if (payloadLength === 126) {
                payloadLength = buffer.readUInt16BE(currentOffset);
                currentOffset += 2;
            } else {
                // 127
                // If this has a value, the frame size is ridiculously huge!
                const leftPart = buffer.readUInt32BE(currentOffset);
                const rightPart = buffer.readUInt32BE(currentOffset += 4);
                // Honestly, if the frame length requires 64 bits, you're probably doing it wrong.
                // In Node.js you'll require the BigInt type, or a special library to handle this.
                throw new Error('Large payloads not currently implemented');
            }
        }
        let maskingKey;
        if (isMasked) {
            maskingKey = buffer.readUInt32BE(currentOffset);
            currentOffset += 4;
        }
        // Allocate somewhere to store the final message data
        let data = Buffer.alloc(payloadLength);
        // Only unmask the data if the masking bit was set to 1
        if (isMasked) {
            // Loop through the source buffer one byte at a time, keeping track of which
            // byte in the masking key to use in the next XOR calculation


            // for (let i = 0, j = 0; i < payloadLength; ++i, j = i % 4) {
            //     // Extract the correct byte mask from the masking key
            //     const shift = j = 3 ? 0 : (3 - j) << 3;
            //     const mask = (shift == 0 ? maskingKey : (maskingKey >>> shift)) & 0xFF;
            //     // Read a byte from the source buffer

            //     const source = buffer.readUInt8(currentOffset++);
            //     // const source = buffer.readUInt8(currentOffset);
            //     // currentOffset++

            //     // XOR the source byte and write the result to the data
            //     // buffer.data.writeUInt8(mask ^ source, i);
            //     data.writeUInt8(mask ^ source, i);
            // }
            let mask0 = (maskingKey >>> 24) & 0xFF
            let mask1 = (maskingKey >>> 16) & 0xFF;
            let mask2 = (maskingKey >>> 8) & 0xFF;
            let mask3 = mask = (maskingKey) & 0xFF;
            for (let i = 0; i < payloadLength; i++) {
                let j = i % 4;
                let mask;
                switch (j) {
                    case 0: mask = mask0; break;
                    case 1: mask = mask1; break;
                    case 2: mask = mask2; break;
                    case 3: mask = mask3; break;
                    default: console.log("Error While Masking Decryption")
                }
                // let mask = maskingKey.readUInt8(j)
                // let source = buffer.readUInt8(currentOffset++)
                // currentOffset++

                // console.log(i, "This is the counter value")
                let source;
                if (bufferFullLength <= currentOffset) {
                    console.log("********************************")
                    console.log("Yes it is equal to the buffer length")
                    console.log("Buffer Length : ", bufferFullLength, "Offset : ", currentOffset, "Current Counter: ", i, "Payload Lenght: ", payloadLength)
                    console.log("********************************")
                } else {
                    source = buffer.readUInt8(currentOffset)
                    ++currentOffset
                }
                let xored = mask ^ source
                data.writeUInt8(xored, i)
            }



        } else {
            // Not masked - we can just read the data as-is
            // buffer.copy(data, 0, currentOffset++);
            buffer.copy(data, 0, currentOffset);
        }
        // console.log(maskingKey, "maskingKey") //Gives an interger, of course of 32 bits
        data = new Uint8Array(data)
        data = ConverArrayBufferToString(data)
        currentOffset = null //Just in case as we are receiving a lot of offset out of range
        try {
            data = JSON.parse(data)
            return data
        } catch (error) {
            console.log(error)
        }
        // const json = data.toString('utf8'); //Also work similar to the above ConverArrayBufferToString
        // console.log(json, "at the last")
    }

}


function ConverArrayBufferToString(decrypted) {
    let string = ''
    for (let i = 0; i < decrypted.length; i++) {
        string += String.fromCharCode(decrypted[i])
    }
    return string
}

function generateAcceptValue(acceptKey) {
    return crypto
        .createHash('sha1')
        .update(acceptKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
        .digest('base64');
}


