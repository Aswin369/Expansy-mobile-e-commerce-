const User = require("../../models/userSchema")
const Address = require("../../models/addressSchema")
const mongoose = require("mongoose")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")
const Order = require("../../models/orderSchema")
const env = require("dotenv").config()
const session = require("express-session")
const Wallet = require("../../models/walletSchema")
const Product = require("../../models/productSchema")

const getProfilePage = async (req, res) => {
    try {
        const id = req.session.user;
        const page = parseInt(req.query.page) || 1;
        const addressPage = parseInt(req.query.addressPage) || 1; // Address pagination
        const limit = 5;
        const addressLimit = 2; // Limit per page
        const skip = (page - 1) * limit;
        const addressSkip = (addressPage - 1) * addressLimit;

        // Get user data
        const userData = await User.findById({_id: id});
        const walletDetails = await Wallet.find({userId: id});

        // Get user address (single document with multiple addresses)
        const userAddress = await Address.findOne({ userId: id });

        // If user has addresses, paginate them
        let paginatedAddresses = [];
        let totalAddressPages = 0;

        if (userAddress && userAddress.address.length > 0) {
            totalAddressPages = Math.ceil(userAddress.address.length / addressLimit);
            paginatedAddresses = userAddress.address.slice(addressSkip, addressSkip + addressLimit);
        }

        // Orders Pagination
        const totalOrders = await Order.countDocuments({userId: id});
        const totalPages = Math.ceil(totalOrders / limit);
        const orderDetails = await Order.find({userId: id})
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'products.productId',
                select: 'productName productImage'
            });

        res.render("profilePage", {
            user: id,
            data: userData,
            address: paginatedAddresses, // Send only paginated addresses
            oderData: orderDetails,
            walletData: walletDetails,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            addressPagination: {
                currentAddressPage: addressPage,
                totalAddressPages: totalAddressPages,
                hasNextAddressPage: addressPage < totalAddressPages,
                hasPrevAddressPage: addressPage > 1
            }
        });

    } catch (error) {
        console.error("Error occurred in getProfilePage", error);
        res.redirect("/pageerror");
    }
};



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
        
        console.log("orderDetails",orderDetails)

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
        const {orderId, productId, quantity, specId, id, amount} = req.query
        console.log("dshka",req.query)
        console.log("asldfkjlasdkjf",req.query)
        const userId = req.session.user

        let quantityToNumber = Number(quantity)

        console.log("quaertity", typeof quantityToNumber)

        const specObjectId = new mongoose.Types.ObjectId(specId);

       
        const productUpdateQuantity = await Product.updateOne({_id:productId,"specification._id":specObjectId},{$inc:{"specification.$.quantity":quantityToNumber}},{new:true})

        console.log("asdfaskljdfojk",productUpdateQuantity)

        

        const order = await Order.updateOne(
            { _id: orderId, "products.productId": productId },
            { 
                $set: { "products.$.status": "Cancelled" }, 
                $inc: { payableAmount: -amount }  
            }
        );
        
        
        console.log("orderasdfkashdf", order)

            console.log("ghfgfdfd", order);
            

        const convertAmount = Number(amount)
        const addWallet =await  Wallet.updateOne({userId:userId},{$inc:{balance:convertAmount}})

        if(addWallet.matchedCount === 0){
            const newWallet = new Wallet({
                userId:userId,
                balance:convertAmount
            })
            await newWallet.save()
        }

        const order1 = await Order.findOne({ _id: orderId });

        const allCancelled = order1.products.every(item => item.status === "Cancelled");

        if (allCancelled) {
            await Order.findByIdAndUpdate(orderId, { $set: { status: "Cancelled" } });
        }
        

        return res.status(201).json({success:true})
    } catch (error) {
        console.error("This error found in deleteOrder", error)
        res.redirect("/pagerror")
    }
}

const cancelOrder = async (req, res) => {
    try {
        const userId = req.session.user;
        const { orderId, reason, totalAmountPrice } = req.body;
        const amount = parseInt(totalAmountPrice);

        // Find the order and populate product details
        const order = await Order.findById(orderId).populate("products.productId");
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Update order status and each product's status in the products array
        await Order.findByIdAndUpdate(orderId, {
            $set: { 
                status: "Cancelled", 
                returnReason: reason, 
                "products.$[].status": "Cancelled" // Update all product statuses to "Cancelled"
            }
        });

        // Increment product quantities in the Product collection
        for (const item of order.products) {
            const product = await Product.findById(item.productId);

            if (!product) continue; // Skip if product not found

            const specIndex = product.specification.findIndex(spec => 
                spec._id.toString() === item.specId.toString()
            );

            if (specIndex !== -1) {
                product.specification[specIndex].quantity += item.quantity;
                await product.save();
            }
        }

        // Wallet logic
        const wallet = await Wallet.findOne({ userId: userId });

        if (!wallet) {
            const walletData = new Wallet({
                userId: userId,
                balance: amount
            });
            await walletData.save();
        } else {
            wallet.balance += amount;
            await wallet.save();
        }

        return res.status(201).json({ success: true });

    } catch (error) {
        console.error("Error in cancelOrder:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};



const profilePageChangePassword = async (req, res) => {
    try {
        const userId = req.session.user;
        
        const { oldPassword, newPassword } = req.body
        const user = await User.findOne({ _id: userId });
        console.log("user", user)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isMatch) {
            return res.status(400).json({ success:false, message: "Old password is incorrect" })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await User.updateOne({ _id: userId }, { $set: { password: hashedPassword }})
        console.log("updated ")
        res.status(200).json({success:true, message: "Password updated successfully"})

    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

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
    cancelOrder,
    profilePageChangePassword
}