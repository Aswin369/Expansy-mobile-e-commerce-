const express = require("express")
const app = express()
const path = require("path")
const env = require("dotenv").config()
const db = require("./config/db")
db()

const PORT = process.env.PORT 

app.set("views",path.join(__dirname, "views"))
app.set("view engine", "ejs")
app.use(express.static("public"))

app.get("/user/login",(req,res)=>{
    res.render("user/login/login")
})

app.get("/user/signup",(req,res)=>{
    res.render("user/signup/signup")
})

app.get("/user/otp",(req,res)=>{
    res.render("user/otpverification/otpverification")
})

app.listen(PORT,()=>console.log("Server is running"))

module.exports = app
