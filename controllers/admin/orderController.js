const Order = require("../../models/orderSchema")
const getOrderPage = async (req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 4
        const skip = (page-1)*limit
        const oderList = await Order.find({})
        .sort ({createdAt: -1})
        .skip(skip)
        .limit(limit)
        .populate("userId")

       

        const totalOrder = await Order.countDocuments()

        const totalPages = Math.ceil(totalOrder/limit)

        res.render("orderList",{
            data: oderList,
            currentPage : page,
            totalPages: totalPages,
            totalOrder: totalOrder
        })

    } catch (error) {
        console.error("This error occured in getOrderPage",error)
        res.redirect("/pageerror")
    }
}

const getOrderDetailPage = async(req,res)=>{
    try {
        const id = req.params.id
        console.log("This is my id",id)
        const orderDetailData = await Order.findById(id)
        .populate("userId")
        .populate({path: "products.productId", model: "Product",})
        console.log("order data", orderDetailData)
        res.render("orderDetail",{
            orderData: orderDetailData
        })
    } catch (error) {
        
    }
}

module.exports = {
    getOrderPage,
    getOrderDetailPage
}