const User = require("../../models/userSchema")
const Address = require("../../models/addressSchema")
const getProfilePage = async (req,res)=>{
    try {
        
        const id = req.session.user
        const userData = await User.findById({_id:id})
        
        res.render("profilePage",{
            data:userData
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
        console.log("this is user id",userId)
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
        console.log("This is user session",userId)
        console.log("this is add req.body", req.body)

        const {address, city, landmark, state, pincode, phone, altPhone} = req.body

        const addressData = new Address({
            userId:userId,
            address:[{
            addressType:address,
            city:city,
            landMark:landmark,
            state:state,
            pincode: Number(pincode),
            phone:phone,
            altPhone:altPhone
            }]
            
        })
        console.log("this is ready",addressData)
        await addressData.save()
        console.log("completed")
        return res.status(201).json({message:"Address added successfully",success:true})
    } catch (error) {
        console.error(error)
        res.redirect("/pageerror")
    }
}

module.exports = {
    getProfilePage,
    editUserProfile,
    addUserAddress
}