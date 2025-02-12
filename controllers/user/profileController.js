const User = require("../../models/userSchema")

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

        return res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        console.error("Error occured in profilUpdat",error)
        res.redirect("/pageerror")
    }
}

module.exports = {
    getProfilePage,
    editUserProfile
}