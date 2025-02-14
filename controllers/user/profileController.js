const User = require("../../models/userSchema")
const Address = require("../../models/addressSchema")
const mongoose = require("mongoose")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")
const env = require("dotenv").config()
const session = require("express-session")

const getProfilePage = async (req,res)=>{
    try {
        
        const id = req.session.user
        const userData = await User.findById({_id:id})
        const userAddress = await Address.find({userId:id})
        
        res.render("profilePage",{
            data:userData,
            address:userAddress
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
            subject: "Verify your account. OTP for password reset",
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

const getForgotPassPage = async (req,res)=>{
    try {
        res.render("forgot-password")
    } catch (error) {
        res.redirect("/pageNotFound");
    }
}

const forgotEmailValid = async (req,res)=>{
    try {
        const {email} = req.body
        console.log("this is email", email)
        const findUser = await User.findOne({email:email})
        if(findUser){
            const otp = generateOtp()
            const emailSent = await sendVerificationEmail(email,otp)
            if(emailSent){
                req.session.userOtp = otp;
                req.session.email = email
                res.render("forgotpass-verfiyOtp")
                console.log("ForgotPassword OTP", otp)
    
            }else{
                res.json({success:false, message:"Failed to send OTP. Please try agian"})
            }
        }else{
            res.render("forgot-password",{
                message:"User with this email does not exists"
            })
        }
        
    } catch (error) {
        console.error("This is error occured in forgot password send email",error)
        res.redirect("/pageerror")
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
    forgotEmailValid
}