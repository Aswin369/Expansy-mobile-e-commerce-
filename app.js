const express = require("express")
const app = express()
const path = require("path")
const env = require("dotenv").config()
const userRouter = require("./routes/userRouter")
const db = require("./config/db")
db()
const PORT = process.env.PORT 

app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.set("views",[path.join(__dirname, "views/user"),path.join(__dirname,"views/admin")])
app.set("view engine", "ejs")
app.use(express.static("public"))

app.use("/",userRouter)
app.use("/*",(req,res)=>{
    res.status(404).render("404")
})
app.listen(PORT,()=>console.log("Server is running"))

module.exports = app
