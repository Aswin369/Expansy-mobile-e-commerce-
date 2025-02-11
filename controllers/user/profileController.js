
const getProfilePage = async (req,res)=>{
    try {
        res.render("profilePage")
    } catch (error) {
        console.error("Error occured in getProfilePage",error)
        res.redirect("/pageerror")
    }
}

module.exports = {
    getProfilePage
}