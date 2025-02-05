const User = require("../../models/userSchema")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")
const env = require("dotenv").config()
const productSchema = require("../../models/productSchema")

const loadHomepage = async (req, res) => {
    try {
        const user = req.session.user;
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;

        console.log("page number", page)
    
        const products = await productSchema.find({ isBlocked: false })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit);

        const totalProducts = await productSchema.countDocuments({ isBlocked: false });
        const totalPages = Math.ceil(totalProducts / limit);

        if (user) {
            const userData = await User.findOne({ _id: user._id });
            
            res.render("home", { 
                user: userData, 
                product: products,
                currentPage: page,
                totalProducts: totalProducts,
                totalPages: totalPages
            }); 
        } else {
            res.render("home", { 
                user: null, 
                product: products,
                currentPage: page,
                totalProducts: totalProducts,
                totalPages: totalPages
            }); 
        }
    } catch (error) {
        console.error("Error loading home page:", error);
        res.status(500).send("Server error");
    }
};


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

        req.session.userOtp = {otp, otpExpiry}
        
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
        const { otp: storedOtp, otpExpiry } = req.session.userOtp || {};
        console.log("Stored OTP:", storedOtp, "Expiry:", otpExpiry);
        console.log("Current Time:", Date.now());
        console.log("This is from verify otp session",req.session.userOtp )

        // Check if OTP is missing or expired
        if (!storedOtp || !otpExpiry || Date.now() > otpExpiry) {
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

const loadlogin = async (req,res)=>{
    try{
        if(!req.session.user){
            return res.render("login")
        }else{
            res.redirect("/")
        }
    }catch(error){
        console.log("Login page not found")
        res.redirect('/404')
    }
}

const login = async (req, res)=>{
    try {
        const {email, password} = req.body
        const findUser = await User.findOne({isAdmin:0, email:email})
        if(!findUser){
            return res.render("login",{message: "Invalid credantials"})
        }
        if(findUser.isBlocked){
            return res.render("login",{message: "User is blocked by admin"})
        }
        const passwordMatch = await bcrypt.compare(password, findUser.password)

        if(!passwordMatch){
            return res.render("login", {message: "Incorrect Password"})
        }
        req.session.user = findUser._id;
        res.redirect('/')
    } catch (error) {
        console.error("Login error",error)
        res.render("login",{message: "login failed. Please try again"})
    }
}

const loadPageNotFound = async (req,res)=>{
    try{

        return res.render("404")
    }catch(error){
        console.error("Page not found page error")
        res.status(500).send("Internal server error")
    }
}

module.exports = {
    loadHomepage,
    verification,
    loadsignup,
    login,
    loadlogin,
    signup,
    loadPageNotFound,
    verifyOtp,
    resendOtp
    
}