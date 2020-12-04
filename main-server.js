const http = require('http')
const crypto = require('crypto');
const { Console } = require('console');
const server = http.createServer();
const PORT = process.env.PORT || 7001;
const subtle = require('crypto').webcrypto.subtle
var sendToClient = "0"
const RANDOM_DELAY = 2000
const ARRAY_TIMERS = [400, 500, 600, 700, 800, 900, 1000] //[3000, 10000, 12000, 7000, 11000, 5000, 15000]  // [400, 500, 600, 700, 800, 900, 1000]

const { performance } = require('perf_hooks');
let time;
let finalTime;


var ClientsStorage = {}
var TimersStorage = {}

server.on('request', HandleRequest)
server.listen(PORT, ListenStart);
// let INITIAL_API_ADDRESS = "https://e3db285c3243.ngrok.io"
let INITIAL_API_ADDRESS = process.env.ADDRESS ||
[
{ "address": "https://ddb234033c72.ngrok.io", "usedCounter": 0, "startTime": 0 },
{ "address": "https://e8f68c4c3519.ngrok.io", "usedCounter": 0, "startTime": 0 },
{ "address": "https://8f89617bcf7c.ngrok.io", "usedCounter": 0, "startTime": 0 },
{ "address": "https://e48f1010adfd.ngrok.io", "usedCounter": 0, "startTime": 0 },
{ "address": "https://0eff65eb20a7.ngrok.io", "usedCounter": 0, "startTime": 0 },
{ "address": "https://74bae79f64bc.ngrok.io", "usedCounter": 0, "startTime": 0 },
{ "address": "https://a8af11736683.ngrok.io", "usedCounter": 0, "startTime": 0 },
{ "address": "https://48d95bb00388.ngrok.io", "usedCounter": 0, "startTime": 0 },
{ "address": "https://6c6321a59532.ngrok.io", "usedCounter": 0, "startTime": 0 },
{ "address": "https://92f03fc540bc.ngrok.io", "usedCounter": 0, "startTime": 0 },
]

// INITIAL_API_ADDRESS = JSON.parse(INITIAL_API_ADDRESS)
// const API_ADDRESS_HOST = INITIAL_API_ADDRESS.substr(8, INITIAL_API_ADDRESS.length)
// console.log(API_ADDRESS_HOST)


let rawHekoPublicKey = JSON.stringify({
key_ops: ['encrypt'],
ext: true,
kty: 'RSA',
n: 'wEXJVf_F6o4aeFQ92d2z-gsjXl8tcxV0NwF1C40do6LEfpZRYv_bFXBJZJiOQfXfuPYpbFrU3GgSGygBrWp2kfwjwIjYUUAkqIzEI6hSzj7fw7NrG5mGPQfQmCsP_oF287J8f4TpP7uneuSQm22LJTkrmSdCYa50-SACa5STQjoX_57P-myEXhMHpvYaO1BIE7H-gbUrM6CjOiCcM8EpNV5GrFIy3aq5_2FDjIIf7hq_3kWtcj7KRGx7jhgKv3hLgwzARn8_YZiaDCaf0u-TLwHJwoxvpOZfHzSQSrqsDpZc319HDii6xNHjK2fp1c_6byONJSz0jQuDnDzj7FPlGoByt14FLNSzVQfnuwusc9mhAjgK2Gj3TxmU68yryT0-1DZiQWr_1EJxtTJTHYBYyi4rOXP5nAfrVyV2fnXptvz7HinXgDFD-7QpTc9h8hobgxIyh8nW6Wvbl_ifhCXyTxLk2l86H8FBow9mgP6CDKa7V06Mu1nHLyu2bB5sF8Yz6Mb_cPyvxJ1cye_fMYMnFYFKYakUfZSzJncb_dfxEp68QuzNKLf5u8E6bfX5KkYscE9jKVoQGJzL1ENiLyTKlmnh-iQFiqL8jBkgXlypp6M097OXSgvYgP4hR0ppVRakq0B9OdvoAAATYkWl8SM_k0JdhugEkWi5KoaNF5QGYXc',
e: 'AQAB',
alg: 'RSA-OAEP-256'
})
let parsedHekoPublicKey = JSON.parse(rawHekoPublicKey)
let raw2IvString = process.env.PUBLIC_IV || "236,67,122,52,35,109,70,65,43,74,215,168,207,157,156,241" // "155,207,0,240,227,165,241,76,243,123,82,95,227,67,170,232"
let splitForHeko = raw2IvString.split(",")
let ivArrayForHeko = new Uint8Array(splitForHeko.length)
for (let i = 0; i < splitForHeko.length; i++) {
ivArrayForHeko[i] = splitForHeko[i]
}
subtle.importKey("jwk", parsedHekoPublicKey, { name: "RSA-OAEP", padding: "RSA_PKCS1_PADDING", hash: { name: "SHA-256" } }, true, ["encrypt"]).then(kk => {
parsedHekoPublicKey = kk;
})



let rawHekoPrivateKey = JSON.stringify({
key_ops: ['decrypt'],
ext: true,
kty: 'RSA',
n: 'siRaPgR8ALINt9nFzzNp8ztm2n1Nz4Cs1lA-HOspkMUV-EaHdAJAdU5kDCsHc0PXAr4H_C2w94yiwQ4uzmfXSuJSeN9DDdqTnZVRdIo8ce-nijgh6kPdYoEjk3CjOtmlNM228stow4QAZEYB-xlIsVBE3ht-p0kSh4spKRnZ4_s_VhMDBs-S0VmQLlex3FMzVe4m5ZgNh6jNQnzHaUllhzYQ_pN6oXGTXAzMHSfUHPy7xkeBbICfTvHAXcgfdopGw8QdMBrmKgon0YkkNa_PHw3UnTQCP6xknjdeOR1MXbWK3hvRHYFY7Oo5LH6wleXiSJ7Ri2T3mLPOn_vRy4tQ978SiwFvbeuXxM-W-voPLciaI6N9bj2k7NEWQMDBhT_IczHP8xBKHJ05NjsVT1PedbEPshlZPdHLF3-7S3N1VIGqOkBVUF5sjHS6bqYVbg0rZtCUtKu_aPdecyOcGOWBPNuzcLEjaI5Y0vwniKU3m27SFRg4WisEgju6A8bkPnWoDMIUsWWYLYuKUZ0PflGY7YdoXftY9pJS_lS_kYZlLmCF_E2T_-vCVdDcOzBVIuVzem4xnvt8D56Zq3_pFyyUW430A3zz2AEWyXfIvhYyUaBdJy3KG9Z3dZiUrmIetM_NzdwDTF02_3X8SajvnDETgAWaQzn0zaMxHlj8L4Y5Ejc',
e: 'AQAB',
d: 'Q9JRRSFB8KXZUTCo_czOPptT-kUQdbrAkst0CmCBr6tJRP_dHA6rab3Rm0xahsjCODoPIjRnFqhFYoi6yzx_m_P0gC5IAiNAZhNuMpdakeoy-A2M4_q4c4NE_yI4EvS_0A2t5FwK470CxSpeILIsmc08mu8O1jOcyVvy7MH50bFbGLMeSN6IQAoAOZSLk51dgw6rYmf0ZryegPyukugtrj-oUrPlUUfDWZ1JrKP4Ppz-BGw-2wdRH6YsncfOKrxUWr30etcS39iD9mNnFMV9bo4-bydY39MLb60Ww1njNB4k45DlmX0gVPqLj-Qf6MHf19QXZSGonkt-lCw0YHEG_tjks8lvErYsVZXbCTUGME945WJtQU3M9Ck_3YCeEU3_JzyVVL4wB-AwKxCKg7avRTTqEFHH9d_7STFMH7X0nnpF_KORnoAToHapnUmg_4nu9Y6GaaPlYAvEQA2xnmGj0LVALGxgcRBGOpHQjF32A5f_DI2OVO_ULJwFPoHGnpUyRDv0eUYvf0JiAjsLf7_8-vwryxntgUCUjSV4MspuRFI5kxoCZILuNUNZpIYRbW1VK9J8tlWNbOl22h_1K1LBuAHHKGkAW5qL90QZHhSEy3uC0Cv3VW8yFomX_L71ZY-rzG6855HVjoSrKJzmMlAD_O-jt_A9PrbSEunriKBYzgE',
p: '27DCpKEEMuwPAv2K1pHecJ19H3zdqr_vTLdcm6GxbEEpodMfm_DtGCoD942Ds61aymWlUqZHsXQ_m2iQCZJL8CeYwgxaBrcvF2xeDzwkOg3xSRNo_RpIH3wd12Ev4kMRd0NCCQaECfyN6EcIizI81DcMqGH8ukgPu3LjgIKclBGLGwiJXSHv92lYCXtxETbqzUuG_k-22eKiDXWbIudS9mOwKYFLalua_7Wo29GZJnnU5JE-rfabU796CsX5Om6RVcvb5hrP5nbnG7FxSc2rbu3a78KMjXUS3-VFX_D8ebzWFYhDAoc2HmrIeixELBkNwOynkCL_IUFy32Er0QQtNw',
q: 'z5WmmvlHOW9FM-wsx8fTX9Ax4rosQpiijIG0z2fQLEtTKyp66ihDx_7xFZRpqQFi7NPrRKt5nthAlx9ztHQ1pwVdtZWYJc1OZvq7kkz1id-QqY8Fn32eAUKVyxwo7jUltSKb4VMaQIxhjyvma6WA7yRuQyKfk00hftpqMEUAwiHIdIzbWjy_oxM1td7RvORdmWfb4qay3mng_ia8oMZRCAxjhIiWoo35Ag_DwYxrEhtRl8ep-lr2XwavbEJYisluSz_NYXeAy25hkFzCVOpb4uFc2w4pwYeLSGyIA967fuCXI91bI-gZwiyak2qsfR8A7bzOv7Z2xc8bYdFocVzDAQ',
dp: 'yJ-WURN-Kyap2thBlwuk8IDSCBRWth0LYqq8lp_F0A99_ns4DYeqbXvJHaQNVuOD2vuSS3TwWdzITZrilusUEB-JAASZnjJhfemHyC_rAV1EMLDaGvGKVb5Z3huxx9XpuFkij-10XU5XJXzhD4T0SfRvycGaM1-lhlA39F7SsOGIgEp-bx-T7gQ00ov5SHg3Wv2TLOENIdM2nEX_Q5OujrWg5XZesaUwWj7CEuRJEPsHcSg27lUbqhJdWENNA5B_hrNhgLSRkWyaRw73XyfEW8w5OOUYyAHXF8JfZWtElcPeWdGTKFbkFEj-BZwxMXg7uCgmKZncFbmYNuidRAalZw',
dq: 'jVwWkZBRnV4VnS8mq4F7gtLPNducClnQz6gATgEe9RrybwHFpDF5Pvdwi0Z-0XU9PZNuslunPbF8Aq2LaIZ-hteTofVWH9_4lQ4Hr7AywQn6hEz-AkdT0v3Z7e-mO9j7bac8yauCxBQU15-IkSOqcq-3WoZ4bqHmvnDUQTysMIc674uAUKnvwohxWgF7iItm5fGg_m6Qff9SFSCh8UY7piRxnK47DkVqHapIn0QVIcZywM5aBT_uaHWv_iQMEa7sKdgv70Cm92GalOll-NeDbTQUvKOfccfw5Ifr8964hcVBh03VI9WJvP4M4XiSL75uLncVv93scfYAapNk8VW_AQ',
qi: 'r9-xlf687fD6gazbjkjov3ZCNEEH1SW4FVFLMNC1tfxDJs-0862fTToFtsv4putM3oLa-z7hZ34bkHMh5AP0mon8VRxKaEiLNqlFuUZ7xM3_mVSaJePBmF77lhb6OQ0CPMH_g09VWaTXFRqsWoXMa_vH9_iS9JEOWzA0_P4YqHzsaEkXcInKlQwHyeWPog_5HXeMge1qvHM0Q4YudItJzyG3obQ0GQFYpqsBpU6GaN09eMsSyy3nv6BxoFG8-wQB8ln58r9ZaYKv2TR1S9O4k41XDP97WcgR6fm5HL1VW3-9gQGHfcgsWWn7WcyJCOiYXjVjGTZKDTcoPquBUfMifw',
alg: 'RSA-OAEP-256'
})
let parsedHekoPrivateKey = JSON.parse(rawHekoPrivateKey)
let raw2IvString2 = process.env.PRIVATE_IV || "121,19,199,207,80,18,86,123,194,37,83,178,136,31,189,196" //"155,207,0,240,227,165,241,76,243,123,82,95,227,67,170,232"
let splitForHeko2 = raw2IvString2.split(",")
let ivArrayForHeko2 = new Uint8Array(splitForHeko2.length)
for (let i = 0; i < splitForHeko2.length; i++) {
ivArrayForHeko2[i] = splitForHeko2[i]
}
subtle.importKey("jwk", parsedHekoPrivateKey, { name: "RSA-OAEP", padding: "RSA_PKCS1_PADDING", hash: { name: "SHA-256" } }, true, ["decrypt"]).then(kk => {
parsedHekoPrivateKey = kk;
})

var policyLimit = 0






// const WebSocket = require('ws');
const { Server } = require('ws');
const wss = new Server({ server });

// const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', function connection(localWs,req) {
ws = localWs
ws.isAlive = true;
console.log("Received Message From: ", req.socket.remoteAddress)
ws.send("Connection Established")
ws.on("error", () => {
ws.terminate();
ws = null
ws = undefined
console.log("Error::: Socket Problem")
})
ws.on('message', function incoming(data) {
if (data == "Connection Open") {
console.log("Received the opening message from the client.")
return;
}
let uniqueIdProvidedByApi = data.split("&>&")[1]
if (ClientsStorage[uniqueIdProvidedByApi]) {
let originalRequest = ClientsStorage[uniqueIdProvidedByApi]["request"]
let originalResponse = ClientsStorage[uniqueIdProvidedByApi]["response"]
let receivedBody = data
runTheSender(originalRequest, originalResponse, receivedBody)
}
async function runTheSender(originalRequest, originalResponse, receivedBody) {

console.log("=======Handle Response======")
let origin = originalRequest.headers.origin
try {
console.log("Actual Body: ", receivedBody.toString().substring(0, 19))
let splitMessages = receivedBody.split(">>>")
receivedTopHeaders = splitMessages[1]
let newSplitMessages = receivedBody.split("<<<")
receivedBottomBody = newSplitMessages[1]
if (typeof receivedTopHeaders == "undefined" || typeof receivedBottomBody == "undefined") {
console.log(receivedBody, "THE ACTUAL WHOLE BODY THAT WE NEED TO SEE")
}

DecryptForHeko(receivedTopHeaders, callMEE, originalRequest, originalResponse)
function callMEE(buffer, error = "", originalRequest, originalResponse) {
if (error != "") { console.log(error); return; }
let splittedMessages;
let receivedStatusCode;
let receivedHeaders;
try {
splittedMessages = buffer.split("^^**^^")
receivedStatusCode = splittedMessages[0].toString()
receivedHeaders = JSON.parse(splittedMessages[1])
} catch (error) {
sendToClient = "0"
console.log("ERROR:: WHILE SPLITTING THE MESSAGE", error)
ErrorHandle("ERROR:: WHILE SPLITTING THE MESSAGE", "1", originalRequest, originalResponse)
return;
}
DecryptForHeko(receivedBottomBody, callMeAgain, originalRequest, originalResponse)
function callMeAgain(buffer, error = "", originalRequest, originalResponse) {
if (error != "") { console.log(error); return; }
console.log("Origin:", origin, /*"StatusCode:", receivedStatusCode, */ "\n" + "Sending Body: ", buffer.substring(0, 50))
originalResponse.writeHead(receivedStatusCode, {
...receivedHeaders,
'Access-Control-Allow-Origin': `${origin}`,
'Access-Control-Allow-Methods': `${originalRequest.method}`,
})
originalResponse.write(buffer)
originalResponse.end()

let uniqueID = originalResponse["uniqueID"]
delete ClientsStorage[uniqueID]
clearTimeout(TimersStorage[uniqueID])
delete TimersStorage[uniqueID]
// console.log("ClientsStorage: ", ClientsStorage, "TimersStorage: ", TimersStorage)

// finalTime = performance.now()
// console.log("Time Taken: ", Math.floor(finalTime - time), " ms")
// console.log("******************************")
}
}
} catch (error) {
console.log("ERROR:: WHILE SPLITTING THE MESSAGE DIRECTLY INSIDE THE RESPONSE END FUNCTION", error)
ErrorHandle("ERROR:: WHILE SPLITTING THE MESSAGE", "1", originalRequest, originalResponse)
return;
}
}
})
});
wss.on("close", () => {
ws.terminate();
ws = null
ws = undefined
console.log("Connection To The Server Closed/Lost")
})
wss.on("error", () => {
ws.terminate();
ws = null
ws = undefined
console.log("Error::: Big Socket Problem Problem")
})





function HandleRequest(incomingMessage, response) {
// time = performance.now()
if (typeof ws == "undefined") {
ErrorHandle("Server has not connected.", "1", incomingMessage, response)
return;
} else if (ws.isAlive === false) {
ws.terminate();
ws = null
ws = undefined
ErrorHandle("Socket is not alive. Connection Lost/Closed.", "1", incomingMessage, response)
return;
}
console.log("======Request Received======")
const url = incomingMessage.url
const method = incomingMessage.method
const headers = incomingMessage.headers
const req = incomingMessage
const res = response
console.log("URL: ", url, "METHOD: ", method)


const replacerFunc = () => {
const visited = new WeakSet();
return (key, value) => {
if (typeof value === "object" && value !== null) {
if (visited.has(value)) {
return;
}
visited.add(value);
}
return value;
};
};

let reqStringify = JSON.stringify(req, replacerFunc());

req.on("error", ErrorHandle)
res.on("error", ErrorHandle)
let headersObj = {
'Access-Control-Allow-Origin': `${req.headers.origin}`,
'Access-Control-Allow-Methods': "POST",
'Content-Type': "text/json",
'X-Powered-By': "GoodOne.JS",
}
if (method == "OPTIONS") {
let headersList = req.headers["access-control-request-headers"] // Do not use the Pascal Casing for htat as server always change it to lower case
// console.log(req.headers)
object = {
'Access-Control-Allow-Origin': `${req.headers.origin}`,
'Access-Control-Allow-Credentials': true,
'Access-Control-Allow-Headers': `${headersList}`,
'Access-Control-Allow-Methods': `${req.method}`,
'Content-Type': "text/json",
'X-Powered-By': "OptionsServed.GoodJS",
}
res.writeHead(201, { ...object })
res.end()
// console.log("Options Sent To: ", object["Access-Control-Allow-Origin"])
}
else if (method == "POST" || method == "GET") {
let str = ""
req.on("data", function (chunk) {
str += chunk
})
req.on("end", function () {
let substitutedReqObj = MakeSubstituteReqObject(req)
let uniqueClientIdForResponse = substitutedReqObj.uniqueClientIdForResponse;
if (method == "GET") {
SendTheClientRequestToMainServer(substitutedReqObj, res, "notDefined", uniqueClientIdForResponse)
} else {
SendTheClientRequestToMainServer(substitutedReqObj, res, str, uniqueClientIdForResponse)
}
})
} else {
ErrorHandle("Request Method Not Supported", "1", req, res)
}
}


function ErrorHandle(err, sendBack = "0", req = "", res = "") {
console.log("Error:: ", err)
if (sendBack != "0") {
res.writeHead(404, { "stats": "error" })
res.write("keyError")
res.end()
}
}
function ListenStart(err) {
if (err) {
console.log("Error: While Starting The Server", err);
}
else {
console.log(`Server Started On Port: ${PORT}`)
}
}
function RawArrayStringToTypedArray(rawString) {
// console.log(rawString, typeof rawString)
let split = rawString.split(",")
let array = new Uint8Array(split.length)
for (let i = 0; i < split.length; i++) {
array[i] = split[i]
}
return array;
}
function StringToTypedArray(responseToSend) {
let array = new Uint8Array(responseToSend.length)
for (let i = 0; i < responseToSend.length; i++) {
array[i] = responseToSend.charCodeAt(i)
}
// console.log(array.length, typeof array, "this is the converted string to array")
return array;
}
function ConverArrayBufferToString(decrypted) {
let string = ''
for (let i = 0; i < decrypted.length; i++) {
string += String.fromCharCode(decrypted[i])
}
return string
}
async function SendTheClientRequestToMainServer(originalRequest, originalResponse, body = "notDefined", initialApiAddress) {

let requestToSendToMainServer;
if (body == "notDefined") {
requestToSendToMainServer = JSON.stringify(originalRequest) + "*^*^*^" + "notDefined"
} else {
requestToSendToMainServer = JSON.stringify(originalRequest) + "*^*^*^" + body
}
// console.log(body, originalRequest.headers)
originalRequest = originalRequest
EncryptForHeko(requestToSendToMainServer, callMe, originalRequest, originalResponse)
function callMe(requestToSendToMainServer, err = "notDefined", originalRequest, originalResponse) {
if (err != "notDefined") {
console.log("Error At Heko Encrypt: ", err)
ErrorHandle(err, "1", originalRequest, originalResponse)
return;
};
let length = requestToSendToMainServer.length

function getTheInitialApiAddress(initialApiAddress) {
initialApiAddress = (Math.floor(Math.random() * 10000000000)).toString() + initialApiAddress.toString() + (Math.floor(Math.random() * 10000000000)).toString()
return initialApiAddress
}
initialApiAddress = getTheInitialApiAddress(initialApiAddress)
while (ClientsStorage[initialApiAddress]) {
console.log("Same ClientIdForResponse , So generating a new one.")
initialApiAddress = getTheInitialApiAddress(initialApiAddress)
}
originalResponse["uniqueID"] = initialApiAddress
ClientsStorage[initialApiAddress] = { "response": originalResponse, "request": originalRequest, "body": requestToSendToMainServer }
TimersStorage[initialApiAddress] = setTimeout(ClearTheClientFromStorage, 28000, initialApiAddress)
requestToSendToMainServer = initialApiAddress.toString() + "&>&" + requestToSendToMainServer

ws.send(requestToSendToMainServer.toString())
// object[initialApiAddress] = "fjsl"
}
}
function ClearTheClientFromStorage(uniqueID) {
console.log(`Client ${uniqueID} Is Being Removed From The Storage`)
clearTimeout(TimersStorage[uniqueID])
let response = ClientsStorage[uniqueID]["response"]
ErrorHandle("Timeout Or Maybe Those Socket Errors", "1", "req", response)
delete ClientsStorage[uniqueID]
delete TimersStorage[uniqueID]
return;
}
function MakeSubstituteReqObject(req) {
let url = req.url
let headers = req.headers
let method = req.method
let uniqueId = headers.uniqueRequestId
if (typeof uniqueId == "undefined") {
uniqueId = "notDefined"
console.log("notDefined unique id")
}
let obj = {
"url": url,
"headers": headers,
"method": method,
"uniqueClientIdForResponse": uniqueId
}
return obj
}


async function EncryptForHeko(message, callback, originalRequest, originalResponse) {
try {
message = message + "^^***^^^"
message = StringToTypedArray(message)
subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"])
.then(key => {
let iv = crypto.randomBytes(16);
iv = new Uint8Array(iv)
// console.log("First IV: ", iv)
subtle.encrypt({ name: "AES-GCM", iv: iv }, key, message).then(encrypted => {
subtle.exportKey("raw", key).then(exportedKey => {
let valueToEncrypt = iv.toString() + "^***^" + new Uint8Array(exportedKey).toString()
// console.log("These are the encryption data: ", valueToEncrypt)
subtle.encrypt({
name: "RSA-OAEP",
iv: ivArrayForHeko,
}, parsedHekoPublicKey, StringToTypedArray(valueToEncrypt)
).then(function (encryptedKeys) {
encrypted = new Uint8Array(encrypted).toString()
encrypted = encrypted + "^***^" + new Uint8Array(encryptedKeys).toString()
callback(encrypted, "notDefined", originalRequest, originalResponse)
})
})
})
})
} catch (error) {
sendToClient = "0"
// response.destroy()
console.log("ERROR:: WHILE ENCRYPTING FOR HEKO", error)
ErrorHandle("ERROR:: WHILE ENCRYPTING FOR HEKO", "1", originalRequest, originalResponse)
// originalResponse.end()
return;
}
}
async function DecryptForHeko(message, callback, originalRequest, originalResponse) {
// console.log("Inside Decrypt ", message.toString().substring(0, 5))
try {
let messagess = message.split("^***^")
let message0 = messagess[0]
let message1 = messagess[1]
let messageBody = RawArrayStringToTypedArray(message0)
let encryptedData = RawArrayStringToTypedArray(message1)
// console.log("Message: ", messageBody)
// console.log("Encrypted Data: ", encryptedData.toString())
subtle.decrypt({
name: "RSA-OAEP",
iv: ivArrayForHeko2,
}, parsedHekoPrivateKey, encryptedData
).then(function (data) {
data = ConverArrayBufferToString(new Uint8Array(data))
// console.log("Data After RSA decryption: ", data)
data = data.split("^***^")
let iv = RawArrayStringToTypedArray(data[0])
let rawKey = RawArrayStringToTypedArray(data[1])
subtle.importKey("raw", rawKey, "AES-GCM", true, ["encrypt", "decrypt"]).then(key => {
subtle.encrypt({ name: "AES-GCM", iv: iv }, key, messageBody).then(encrypted => {
messageBody = ConverArrayBufferToString(new Uint8Array(encrypted))
messageBody = messageBody.split("^^***^^^")[0]
// callback(messageBody)
callback(messageBody, "", originalRequest, originalResponse)
// console.log("Decrypted Message: ", messageBody)
// console.log("Splitted Decrypted Message", messageBody.split( "^^***^^^" )[0])
})
})
})
} catch (error) {
sendToClient = "0"
// response.destroy()
console.log("ERROR:: WHILE DECRYPTING FOR HEKO", error)
ErrorHandle("ERROR:: WHILE DECRYPTING FOR HEKO", "1", originalRequest, originalResponse)
// originalResponse.end()
return;
}

}
async function Worker(host, port, path, body, callback) {
var _options = {
host: host,
port: port,
path: path,
method: 'POST',
'content-type': 'application/json',
}

var req = http.request(_options, function (response) {
let bodyReceived;
response.on("data", function (chunk) {
bodyReceived += chunk
})
response.on("end", function () {
callback(bodyReceived, "notDefined")
})
});
req.on('error', function (err) {
callback("notDefined", err)
})
req.write(body)
req.end()
}
