const Brand = require("../../models/brandSchema")
const Product = require("../../models/productSchema")
const Order = require("../../models/orderSchema")

const getSalesReport = async (req, res) => {
    const { filter, startDate, endDate } = req.query;

    let matchCondition = {};
    let labels = [];
    let salesValues = [];

    // Filter Logic
    if (filter === 'custom') {
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Please provide a valid date range.' });
        }
        matchCondition.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };

        // Generate Full Date Range (Ensure All Dates Appear)
        const start = new Date(startDate);
        const end = new Date(endDate);
        while (start <= end) {
            labels.push(`${start.getDate()}-${start.getMonth() + 1}-${start.getFullYear()}`);
            salesValues.push(0); // Default 0 for missing data
            start.setDate(start.getDate() + 1);
        }

    } else if (filter === 'weekly') {
        const today = new Date();
        const pastWeek = new Date(today);
        pastWeek.setDate(today.getDate() - 6); // Show 7 days including today

        matchCondition.createdAt = {
            $gte: pastWeek,
            $lte: today
        };

        // Generate Full Week Range (Ensure All Dates Appear)
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            labels.push(`${date.getDate()}-${date.getMonth() + 1}`);
            salesValues.push(0); // Default 0 for missing data
        }

    } else if (filter === 'monthly') {
        const thisYear = new Date().getFullYear();
        matchCondition.createdAt = {
            $gte: new Date(`${thisYear}-01-01`),
            $lte: new Date(`${thisYear}-12-31`)
        };

        // Generate All 12 Months (Ensure All Months Appear)
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        salesValues = new Array(12).fill(0); // Default 0 for missing data

    } else if (filter === 'yearly') {
        const thisYear = new Date().getFullYear();
        matchCondition.createdAt = {
            $gte: new Date(`${thisYear - 5}-01-01`),  // Start 5 years back
            $lte: new Date(`${thisYear}-12-31`)
        };

        // Generate Last 6 Years (Ensure All Years Appear)
        for (let i = 5; i >= 0; i--) {
            labels.push(`${thisYear - i}`);
            salesValues.push(0); // Default 0 for missing data
        }
    }

    try {
        const salesData = await Order.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: filter === 'yearly'
                        ? { year: { $year: "$createdAt" } } // Yearly format
                        : filter === 'monthly'
                        ? { month: { $month: "$createdAt" } } // Monthly format
                        : filter === 'weekly' || filter === 'custom'
                        ? { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" } }
                        : { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    totalSales: { $sum: "$payableAmount" }
                }
            }
        ]);

        console.log("filterdata",salesData)
        // Map Aggregated Sales Data to Labels
        salesData.forEach(item => {
            if (filter === 'yearly') {
                const index = labels.indexOf(`${item._id.year}`);
                if (index !== -1) salesValues[index] = item.totalSales;
            } else if (filter === 'monthly') {
                const index = item._id.month - 1;
                salesValues[index] = item.totalSales;
            } else {
                const label = filter === 'custom'
                ? `${item._id.day}-${item._id.month}-${new Date().getFullYear()}`
                : `${item._id.day}-${item._id.month}`;
                const index = labels.indexOf(label);
                if (index !== -1) salesValues[index] = item.totalSales;
            }
        });
        
        console.log("labels",labels)

        res.json({ labels, salesData: salesValues });

    } catch (error) {
        console.error("Error fetching sales report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = {
    getSalesReport
}