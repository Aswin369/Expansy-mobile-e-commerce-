const User = require("../../models/userSchema")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")
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
            html:`<div style="font-family: Arial, sans-serif; color:rgb(69, 63, 63); ">
            <h2 style="color: rgb(88, 85, 85);">Hi, ${name}</h2>
            <p style="color: rgb(88, 85, 85);">Someone tried to log in to your Expansy account.</p>
            <p style="color: rgb(88, 85, 85);">If this was you, please use the following code to confirm your identity:</p>
            <h1 style="color:rgb(56, 51, 51);">${otp}</h1>
            <p style="color: rgb(88, 85, 85);">If you did not make this request, please ignore this email or contact our support team.</p>
        </div>`
        })

        return info.accepted.length>0

    }catch(error){
        console.error("Error sending email",error)
        return false
    }
}

const signup = async (req,res)=>{
    try{
        const {name, phone, email, password, cpassword} = req.body
        // console.log(name,email,password)
        if(password !== cpassword){
            return res.render("signup",{message: "Password is not matching"})
        }
        const findUser = await User.findOne({email})
        if(findUser){
            return res.render("signup",{message: "User already exists"})
        }

        const otp = generateOtp()
        const otpExpiry = Date.now() + 1 * 60 * 1000;
        
        const emailSent = await sendVerificationEmail(email,otp, name)

        if(!emailSent){
            return res.json("email-error")
        }

        req.session.userOtp = otp
        req.session.userData = {name, phone, email, password}
        console.log("This is userdata from signup", req.session.userData)
        console.log("This is userOtp from signup", req.session.userOtp)
        res.render("otpverification")
        console.log("Otp sent",otp)

    }catch(error){
        console.error("signup error",error)
        res.redirect("/pageNotFound")
    }
}

const securePassword = async (password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    }catch(error){

    }
}

const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body; // OTP entered by the user
        console.log("Input OTP:", otp);

        // Retrieve OTP and expiry from session
        const { otp: storedOtp, expiry } = req.session.userOtp || {};
        console.log("Stored OTP:", storedOtp, "Expiry:", expiry);
        console.log("Current Time:", Date.now());

        // Check if OTP is missing or expired
        if (!storedOtp || !expiry || Date.now() > expiry) {
            console.log("OTP expired or missing.");
            return res.status(400).json({
                success: false,
                message: "OTP expired. Please request a new OTP.",
            });
        }

        // Compare the input OTP with the stored OTP
        if (String(otp) === String(storedOtp)) {
            console.log("OTP verified successfully.");

            // Retrieve user data from session
            const user = req.session.userData;

            // Hash the user's password
            const passwordHash = await securePassword(user.password);

            // Save the user to the database
            const saveUserData = new User({
                name: user.name,
                email: user.email,
                phone: user.phone,
                password: passwordHash,
            });

            await saveUserData.save();

            // Set the user ID in session after successful verification
            req.session.user = saveUserData._id;

            res.status(200).json({
                success: true,
                message: "OTP verified successfully!",
            });
        } else {
            console.log("OTP mismatch.");
            return res.status(400).json({
                success: false,
                message: "OTP not verified. Please check again.",
            });
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error. Please try again.",
        });
    }
};

const resendOtp = async (req, res) => {
    try {
        const { email } = req.session.userData;
        console.log("Email is defined or not", email);
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email not found in session.",
            });
        }

        // Generate a new OTP and set its expiry time
        const otp = generateOtp();
        const otpExpiry = Date.now() + 1 * 60 * 1000; // 1-minute expiry

        // Store the OTP and expiry in session
        req.session.userOtp = { otp, expiry: otpExpiry };

        console.log("New OTP:", otp, "Expiry:", new Date(otpExpiry).toISOString());

        // Send the OTP via email
        const emailSent = await sendVerificationEmail(email, otp);

        if (emailSent) {
            res.status(200).json({
                success: true,
                message: "OTP resent successfully! Expires in 1 minute.",
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Failed to resend OTP. Please try again.",
            });
        }
    } catch (error) {
        console.error("Error resending OTP:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error. Please try again.",
        });
    }
};




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
    loadPageNotFound,
    verifyOtp,
    resendOtp
}