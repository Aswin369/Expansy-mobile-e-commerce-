const User = require("../../models/userSchema")
const Address = require("../../models/addressSchema")
const mongoose = require("mongoose")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")
const Order = require("../../models/orderSchema")
const env = require("dotenv").config()
const session = require("express-session")


const getProfilePage = async (req,res)=>{
    try {
        
        const id = req.session.user
        const userData = await User.findById({_id:id})
        const userAddress = await Address.find({userId:id})
        const oderDetails = await Order.find({userId:id})

        console.log("dafhjk",oderDetails )
        res.render("profilePage",{
            user:id,
            data:userData,
            address:userAddress,
            oderData: oderDetails
        })

    } catch (error) {
        console.error("Error occured in getProfilePage",error)
        res.redirect("/pageerror")
    }
}

const editUserProfile = async (req,res)=>{
    try {
        const userId = req.session.user
        if(!userId){
            return res.status(401).JSON({message:"User not found"})
        }
        
        const {name, phone} = req.body
        const userData = await User.updateOne({_id:userId},{$set:{name:name,phone:phone }})

        return res.status(201).json({ message: "User updated successfully" });
    } catch (error) {
        console.error("Error occured in profilUpdat",error)
        res.redirect("/pageerror")
    }
}

const addUserAddress = async (req,res)=>{
    try {
        
        const userId = req.session.user

        if(!userId){
            return res.status(401).json({message:"User not found"})
        }
        
        const {address, city, landmark, state, pincode, phone, altPhone} = req.body

       const newAddress = {
            addressType: address,
            city: city,
            landMark: landmark,
            state: state,
            pincode: Number(pincode),
            phone: phone,
            altPhone: altPhone
       }
       
       const userAddress = await Address.findOne({userId})
       
       

       if(userAddress){
        userAddress.address.push(newAddress);
        await userAddress.save()
        return res.status(201).json({message:"Address added successfully",success:true})
       }else{
        const addressData = new Address({
            userId:userId,
            address:[newAddress]
        })
        await addressData.save()
        return res.status(201).json({message:"Address added successfully",success:true})
       }
        
    } catch (error) {
        console.error("This error occured in addUserAddress",error)
        res.redirect("/pageerror")
    }
}

const deleteAddress = async (req,res)=>{
    try {
        const userId = req.session.user
        const id = req.params.addressId 
      
        const objectIdUser = new mongoose.Types.ObjectId(userId)
        

         const updatedUser = await Address.findOneAndUpdate({userId:objectIdUser},{$pull:{address:{_id: id}}},{new:true})
        if(!updatedUser){
            return res.status(404).json({message:"Address not found", success:false})
        }
        return res.status(200).json({message:"Address deleted successfully", success:true})
    } catch (error) {
        console.error("This error occured in deleteAdress",error)
        res.redirect("/pageerror")
    }
}

const getUserAddressId = async (req,res)=>{
    try {
        const userId = req.session.user
        const addressId = req.params.addressId
        
        const objectIdUser = new mongoose.Types.ObjectId(userId)
        const userAddress =  await Address.findOne({userId: objectIdUser,"address._id": addressId},{ "address.$":1})

        if(userAddress){
            return res.json(userAddress.address[0])
        }else{
            return res.json({message:"Address not found"})
        }
        
    } catch (error) {
        console.error("This error occured in getUserAddressId",error)
        res.redirect("/pageerror")
    }
}

const updateAddress = async (req,res)=>{
    try {
        const userId = req.session.user
        const addressId = req.params.addressId
        const {addressType, city, landMark, state, pincode, phone, altPhone} = req.body
        
        const updateAddress = await Address.findOneAndUpdate(
            {
            userId:userId,
            "address._id":addressId
        },
        {
            $set:{
                "address.$.addressType":addressType,
                "address.$.city":city,
                "address.$.landMark": landMark,
                "address.$.state": state,
                "address.$.pincode":pincode,
                "address.$.phone":phone,
                "address.$.altPhone": altPhone
            }
        },
        {new:true}
    )
    console.log("completed");
    
    if(!updateAddress){
        return res.status(404).json({message:"Address not found"})
    }

    res.status(200).json({message:"Address updated successfully", success:true})

    } catch (error) {
        console.error("This error occured in updateAddress",error)
        res.redirect("/pageerror")
    }
}

// forgot password controllers

function generateOtp(){
    return Math.floor(100000+Math.random()*900000).toString()
}

async function sendVerificationEmail(email,otp){
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
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "OTP for Resetting Your Password",
            html: `
                <div style="font-family: Arial, sans-serif; color: rgb(69, 63, 63);">
                    <h2 style="color: rgb(88, 85, 85);">Password Reset Request</h2>
                    <p style="color: rgb(88, 85, 85);">Use the OTP below to reset your password:</p>
                    <h1 style="color: rgb(56, 51, 51);">${otp}</h1>
                    <p style="color: rgb(88, 85, 85);">This OTP is valid for 60 seconds.</p>
                    <p style="color: rgb(88, 85, 85);">If you didn't request this, ignore this email.</p>
                </div>`
        })

        return info.accepted.length>0

    }catch(error){
        console.error("Error sending email",error)
        return false
    }
}

const getForgotPassPage = async (req,res)=>{
    try {
        res.render("forgot-password")
    } catch (error) {
        console.error("This error occured in getForgotPassPage",error)
        res.redirect("/pageerror");
    }
}

const getVerifyOtpPage = async (req,res)=>{
    try {
        res.render("forgotpass-verfiyOtp")
    } catch (error) {
        console.error("This error occured in getVerifyOtpPage",error)
        res.redirect("/pageerror")
    }
}

const forgotEmailValid = async (req,res)=>{
    try {
        const {email} = req.body
        console.log("Tisd email", req.body)
        const findUser = await User.findOne({email:email})
        console.log("This is the user",findUser)

        if(!findUser){
            res.status(400).json({success:false, message:"Please use valid email"})
        }

        if(findUser){
            const otp = generateOtp()
            const otpExpiry = Date.now() + 1 * 60 * 1000;
            const emailSent = await sendVerificationEmail(email,otp)
            if(emailSent){
                req.session.userOtp = otp;
                req.session.email = email
                req.session.otpExpiry = otpExpiry
                res.render("forgotpass-verfiyOtp")
                console.log("THis is first otp", otp)
            }else{
                res.json({success:false, message:"Failed to send OTP. Please try agian"})
            }
        }else{
            res.render("forgot-password",{
                message:"User with this email does not exists"
            })
        }

        console.log("This user session form verify email", req.session)
        
    } catch (error) {
        console.error("This is error occured in forgot password send email",error)
        res.redirect("/pageerror")
    }
}

const verifyForgotPassOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        
        const {userOtp, otpExpiry}  = req.session;
        
        
        if( Date.now() > otpExpiry){
            return res.status(400).json({success:false, message:"OTP expired. Please try again"})
        }

        if (!otp || !userOtp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required"
            });
        }
        if (otp === userOtp) { 
            req.session.userOtp = null;
            console.log("This is from comparing otp now printing session", req.session)
            return res.json({
                success: true,
                redirectUrl: "/change-password"
            });
        } else {
            return res.json({success: false, message: "Invalid OTP. Please try again."})
        }
    } catch (error) {
        console.error("Error occurred in verify OTP:", error);
        return res.status(500).json({success: false, message: "An error occurred. Please try again"})
    }
}

const verifyPasswordResendOTP = async (req, res) => {
    try {
        const userData = req.session;
        
        const {email} = userData
        
        if (!email || !userData) {
            return res.status(400).json({success: false, message: "You has expried. Please try agian"})
        }
        const otp = generateOtp();  
        const otpExpiry = Date.now() + 1 * 60 * 1000;
        req.session.userOtp = otp
        req.session.otpExpiry = otpExpiry
        console.log("this is resend otp", otp)
        const sentEmail = await sendVerificationEmail(email,otp);
        if (!sentEmail) {
            return res.status(500).json({success: false, message: "Failed to send OTP. Please try again."})
        }
        return res.json({
            success: true,
            message: "OTP sent successfully! Please check your email."
        });

    } catch (error) {
        console.error("Error in verifyPasswordResendOTP:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred. Please try again."
        });
    }
}

const getchangePasswordPage = async (req, res) => {
    try {   
        if (!req.session.userOtp === null) {
            return res.redirect('/forgot-password');
        }
        res.render("enterNewPassword");
    } catch (error) {
        console.error("Error in changePassword:", error);
        res.redirect("/pageerror");
    }
}

const securePassword = async (password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    }catch(error){

    }
}

const changePassword = async (req,res)=>{
    try {
        const {confirmPassword} = req.body
        const {email} = req.session
        
        if(!confirmPassword){
             res.status(400).json({success:false, message:"Please try again"})
        }
        const hashPassword = await securePassword(confirmPassword)
        if(!hashPassword){
            res.status(400).json({success:false, message:"Please try again"})
        }
        const finduser = await User.findOneAndUpdate({email:email}, {$set:{password:hashPassword}})
        
        console.log("This is findUser", finduser)

        if(!finduser){
            res.status(400).json({success:false, message:"Password not saved please try again"})
        }

        console.log("saved password")
        res.status(200).json({success:true})
        
    } catch (error) {
        console.error("This error occured in change password", error)
        res.redirect("/pageerror")
    }
}

const loadOrderDetailPage = async (req, res) => {
    try {
        console.log("oderrid ", req.params.orderId);
        const orderId = req.params.orderId;
        const userId = req.session.user
        const orderDetails = await Order.findById(orderId).populate("products.productId")
        
        if (!orderDetails) {
            
            return res.status(404).json({ message: "Order not found" });
        }
        
        res.render("oderDetailPage", {  
            success: true,
            orderData: orderDetails,
        });
    } catch (error) {
        console.error("Error in loadOrderDetailPage:", error);
        res.redirect("/pageerror");
    }
}

const deleteOrder = async(req,res)=>{
    try {
        const {orderId, productId} = req.query
        console.log("dshka",req.query)
        console.log("asldfkjlasdkjf",req.query)
        const userId = req.session.user
        const order = await Order.findOneAndUpdate(
            { _id: orderId, userId:userId},
            { $pull: { products: { _id: productId } } },
            {new:true})
        
        if(order.products<=0){
            await Order.findByIdAndUpdate({_id:orderId},{$set:{status:"Cancelled"}})
           return  res.redirect("/profilePage")
        }
        return res.status(201).json({success:true})
    } catch (error) {
        console.error("This error found in deleteOrder", error)
        res.redirect("/pagerror")
    }
}

const cancelOrder = async (req,res)=>{
    try {
        console.log("req.boy",req.body)
        const {orderId} = req.body
        await Order.findByIdAndUpdate(orderId,{$set:{status:"Cancelled"}})
        console.log("THiscompelfjkasdkjfhasdfasdf")
        return res.status(201).json({success:true})
    } catch (error) {
        
    }
}

module.exports = {
    getProfilePage,
    editUserProfile,
    addUserAddress,
    deleteAddress,
    getUserAddressId,
    updateAddress,
    getForgotPassPage,
    forgotEmailValid,
    verifyForgotPassOtp,
    verifyPasswordResendOTP,
    getchangePasswordPage,
    changePassword,
    getVerifyOtpPage,
    loadOrderDetailPage,
    deleteOrder,
    cancelOrder
}