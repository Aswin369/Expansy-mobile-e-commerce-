
const getPlaceOrderPage = async(req,res)=>{
    try {
        res.render("checkoutPage")
    } catch (error) {
        console.error("This error occured in getPlaceOrderPage",error)
        res.redirect("/pageerror")
    }
}

module.exports = {
    getPlaceOrderPage
}
