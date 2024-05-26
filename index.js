import http from "http";
import path from "path"
import fs from "fs"
import { Server } from "socket.io"
import { addMessages, addUser, getAuthToken, getMessages, isExistUser } from "./database.js";
import cookie from "cookie"

const validToken = []
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
let pathToLoginHtml = path.join(__dirname, "static", "login.html")
let loginHtml = fs.readFileSync(pathToLoginHtml)

let server = http.createServer((req, res) => {
    try {
        // if (req.url == "/" && req.method == "GET") {
        //     return res.end(indexHtmlFile)
        // }
        // if (req.url == "/script.js" && req.method == "GET") {
        //     return res.end(scriptFile)
        // }
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
        if (req.url == "/login" && req.method == "GET") {
            return res.end(loginHtml)
        }
        if (req.url == "/api/login" && req.method == "POST") {
            return loginUser(req, res)
        }
        guarded(req, res)
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
    req.on("end", async function () {
       try{
        data = JSON.parse(data);
        if(!data.login || !data.password){
            res.end("login or password is empty")
            return
        }
        if( !await isExistUser(data.login)){
            res.end("User is already exist")
            return
        }
        await addUser(data.login, data.password)
        res.end("Register success!")
       } catch(err){
        console.log(err)
        res.end("Error:" + err);
       }
        
    })
    res.end()
}

function loginUser(req, res) {
    let data = ""
    req.on("data", function (chunk) {
        data += chunk
    })
    req.on("end", async function () {
       try{
        data = JSON.parse(data);
        if(!data.login || !data.password){
            res.end("login or password is empty")
            return
        }
        let token = await getAuthToken(data)
        validTokens.push(token)
        res.writeHead(200)
        res.end(token)
       } catch(err){
        console.log(err)
        res.writeHead(500)
        res.end("Error:" + err);
       }
        
    })
    res.end()
}

function getCredentials(req){
    let cookies = cookie.parse(req.headers?.cookie || "")
    let token = cookies?.token;
    if(!token || !validTokens.includes(token)) return null
    let [user_id, login] = token.split(".")
    if(!user_id || !login) return null
    return {user_id, login}
}

function guarded(req, res){
    const credentials = getCredentials(req)
    try{
        if(!credentials){
            res.writeHead(301, {Location: "/register"})
            res.end()
        }else if(req.method == "GET"){
            switch(req.url){
                case "/":
                    return res.end(indexHtmlFile)
                case "/script.js":
                        return res.end(scriptFile)
            }
        }
    }catch(err){
        res.writeHead(404)
        res.end(err)
    }
}