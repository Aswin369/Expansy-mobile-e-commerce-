const Order = require("../../models/orderSchema")

const getSaleReport = async (req,res)=>{
    try {
        const countOfOrder = await Order.find().countDocuments()
        console.log("fkasjhdf", countOfOrder)
        res.render("saleReport",{
            countOfOrder
        })
    } catch (error) {
        console.error("This error occured in getSaleReport",error)
        res.redirect("/pageerror")
    }
}

module.exports = {
    getSaleReport
}
