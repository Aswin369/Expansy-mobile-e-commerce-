const getWhishList = async (req,res)=>{
    try {
        res.render("wishList")
    } catch (error) {
        console.error("Error occured in getWhishList",error)
        res.redirect("/pagerror")
    }
}

module.exports = {
    getWhishList
}