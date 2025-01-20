const express = require("express")
const app = express()
const path = require("path")
const env = require("dotenv").config()
const session = require("express-session")
const userRouter = require("./routes/userRouter")
const passport = require("./config/passport")
const db = require("./config/db")
db()
const PORT = process.env.PORT 

app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.use(session({
    secret: process.env.SESSION_SECRECT,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge:72*60*60*1000
    }
}))


app.set("views",[path.join(__dirname, "views/user"),path.join(__dirname,"views/admin")])
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(userRouter)
app.use(passport.initialize())
app.use(passport.session())

app.use("/",userRouter)
app.use("/*",userRouter)
app.listen(PORT,()=>console.log("Server is running"))

module.exports = app
