const getShoppingCart = async(req,res)=>{
    try {
        res.render("shoppingCart")
    } catch (error) {
        console.error("Error found in shopping cart", error)
    }
} 

module.exports = {
    getShoppingCart
}