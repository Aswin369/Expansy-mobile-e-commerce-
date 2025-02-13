const User = require("../../models/userSchema")
const Address = require("../../models/addressSchema")
const mongoose = require("mongoose")

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
        console.log("This is user id ", userId)
        console.log("Id is", id)
        const objectIdUser = new mongoose.Types.ObjectId(userId)
        console.log("this is user referance",objectIdUser)

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

module.exports = {
    getProfilePage,
    editUserProfile,
    addUserAddress,
    deleteAddress
}