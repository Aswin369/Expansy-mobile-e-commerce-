const User = require("../../models/userSchema")
const nodemailer = require("nodemailer")
const env = require("dotenv").config()
const loadHomepage = async (req,res)=>{
    try{
        return res.render("home")
    }catch(error){
        console.log("Home page not found")
        res.status(500).send("Server error")
    }
}

const pageNotFound = async (req,res) =>{
    try{
        return res.render("404")
    }catch(error){
        res.redirect("/pageNotFound")
        res.status(500).send("Server Error")
    }
}

const login = async (req,res)=>{
    try{
        return res.render("login")
    }catch(error){
        console.log("Login page not found")
        res.status(500).send("Server Error")
    }
}

const verification = async (req,res)=>{
    try{
        return res.render("otpverification")
    }catch(error){
        console.log("Verification page not found")
        res.status(500).send("Server Error")
    }
}

const loadsignup = async (req,res)=>{
    try {
        return res.render("signup")
    } catch (error) {
        console.log("Signup page not found")
        res.status(500).send("Server Error")
    }
}

function generateOtp(){
    return Math.floor(100000+Math.random()*900000).toString()
}

async function sendVerificationEmail(email,otp,name){
    try{
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port:587,
            secure:false,
            requireTLS: true,
            auth:{
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD
            }
        })

        const info = await transporter.sendMail({
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject: "Verify your account",
            text:`HIYour OTP is ${otp}`,
            html: `<h1> Hi, ${name} </h1>
           <h3> Someone tried to log in to your Expansy account.</h3>
            <h3>If this was you, please use the following code 
            to conform your identity:</h3> 
            <h1>${otp} </h1>`
        })

        return info.accepted.length>0

    }catch(error){
        console.error("Error sending email",error)
        return false
    }
}

const signup = async (req,res)=>{
    try{
        const {name, email, password, cpassword} = req.body
        // console.log(name,email,password)
        if(password !== cpassword){
            return res.render("signup",{message: "Password is not matching"})
        }
        const findUser = await User.findOne({email})
        if(findUser){
            return res.render("signup",{message: "User already exists"})
        }

        const otp = generateOtp()

        const emailSent = await sendVerificationEmail(email,otp, name)

        if(!emailSent){
            return res.json("email-error")
        }

        req.session.userOtp = otp
        req.session.userData = {email,password}

        // res.render("verify-otp")
        console.log("Otp sent",otp)

    }catch(error){
        console.error("signup error",error)
        res.redirect("/pageNotFound")
    }
}

const loadPageNotFound = async (req,res)=>{
    try{

        res.render("404")
    }catch(error){
        console.error("Page not found page error")
        res.status(500).send("Internal server error")
    }
}

module.exports = {
    loadHomepage,
    pageNotFound,
    login,
    verification,
    loadsignup,
    signup,
    loadPageNotFound
}