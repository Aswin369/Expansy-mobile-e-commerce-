const Order = require("../../models/orderSchema")

const getSaleReport = async (req, res) => {
    try {
        const salesData = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalCancelled: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } },
                    totalPending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
                    totalSuccess: { $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] } },
                    totalSale: { $sum: "$payableAmount" },
                    totalDiscount: { $sum: "$offerAndCouponAmount" }
                }
            }
        ]);

        const result = salesData.length > 0 ? salesData[0] : {
            totalOrders: 0,
            totalCancelled: 0,
            totalPending: 0,
            totalSuccess: 0,
            totalSale: 0,
            totalDiscount: 0
        };

        console.log("total report", result)

        res.render("saleReport", {
            totalOrders: result.totalOrders,
            totalCancelled: result.totalCancelled,
            totalPending: result.totalPending,
            totalSuccess: result.totalSuccess,
            totalSale: result.totalSale,
            totalDiscount: result.totalDiscount
        });

    } catch (error) {
        console.error("This error occurred in getSaleReport:", error);
        res.redirect("/pageerror");
    }
};


const saleReportFilter = async (req, res) => {
    try {
        console.log("Request Data:", req.body);
        const { startDate, endDate } = req.body;

        // Convert startDate and endDate to valid Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);
       

        
        const orders = await Order.find({ 
            createdAt: { $gte: start, $lte: end } 
        }).populate("userId", "name") 
          .sort({ createdAt: -1 }); 

        console.log("orderlist",orders)

        res.json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("This error occurred in saleReportFilter:", error);
        res.json({ success: false, message: "An error occurred while filtering sales data." });
    }
};


module.exports = {
    getSaleReport,
    saleReportFilter
}