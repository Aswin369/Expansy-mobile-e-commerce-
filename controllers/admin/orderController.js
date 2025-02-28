const Order = require("../../models/orderSchema")
const Address = require("../../models/addressSchema")

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
        
        const orderDetailData = await Order.findById(id)
        .populate("userId")
        .populate({path: "products.productId", model: "Product",})
        res.render("orderDetail",{
            orderData: orderDetailData,
            
        })
    } catch (error) {
        console.error("This is getOrderDetailPage",error)
        res.redirect("/pagerror")
    }
}

const changeStatus = async (req,res)=>{
    try {
        
        const {orderId, status} = req.body
        if(!orderId || !status){
            return res.status(401).json({success:false, message:"select an option"})
        }

        const updateOrderStatus = await Order.findByIdAndUpdate(orderId,{$set:{status:status}},{new:true})
        
        return res.status(200).json({success:true})

    } catch (error) {
        console.error("This is error occured in changeStatus",changeStatus)
        res.redirect("/pageerror")
    }
}
module.exports = {
    getOrderPage,
    getOrderDetailPage,
    changeStatus
}
