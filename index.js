import http from "http";
import path from "path"
import fs from "fs"
import { Server } from "socket.io"
import { addMessages, getMessages } from "./database.js";
await addMessages("hello", 1)
let m = await getMessages()
console.log(m)



const __dirname = path.resolve();

let pathToIndex = path.join(__dirname, "static", "index.html")
let indexHtmlFile = fs.readFileSync(pathToIndex)
let pathToStyle = path.join(__dirname, "static", "style.css")
let styleFile = fs.readFileSync(pathToStyle)
let pathToScript = path.join(__dirname, "static", "script.js")
let scriptFile = fs.readFileSync(pathToScript)
let pathToScriptIo = path.join(__dirname, "static", "socket.io.min.js")
let scriptFileIo = fs.readFileSync(pathToScriptIo)
let pathToRegister = path.join(__dirname, "static", "register.html")
let registerHtmlFile = fs.readFileSync(pathToRegister)
let pathToAuthScript = path.join(__dirname, "static", "auth.js")
let authScript = fs.readFileSync(pathToAuthScript)

let server = http.createServer((req, res) => {
    try {
        if (req.url == "/" && req.method == "GET") {
            return res.end(indexHtmlFile)
        }
        if (req.url == "/script.js" && req.method == "GET") {
            return res.end(scriptFile)
        }
        if (req.url == "/style.css" && req.method == "GET") {
            return res.end(styleFile)
        }
        if (req.url == "/socket.io.min.js" && req.method == "GET") {
            return res.end(scriptFileIo)
        }
        if (req.url == "/register" && req.method == "GET") {
            return res.end(registerHtmlFile)
        }
        if (req.url == "/auth.js" && req.method == "GET") {
            return res.end(authScript)
        }
        if (req.url == "/api/register" && req.method == "POST") {
            return registerUser(req, res)
        }
        res.writeHead(404, "Not found")
        return res.end()
    } catch (error) {
        console.error(error.message)
        res.writeHead(500, "Server error")
        res.end()
    }
})

server.listen(3000, function () {
    console.log("Server started on 3000 port")
})

const io = new Server(server)
io.on("connection", (socket) => {
    console.log(`User connected. id ${socket.id}`)
    let userName = ""
    socket.on("set_nickname", (data) => {
        userName = data
    })
    socket.on("new_message", (data) => {
        io.emit("message", userName + " : " + data)
    })

})

function registerUser(req, res) {
    let data = ""
    req.on("data", function (chunk) {
        data += chunk
    })
    req.on("end", function () {
        data = JSON.parse(data)
        console.log(data)
    })
    res.end()
}