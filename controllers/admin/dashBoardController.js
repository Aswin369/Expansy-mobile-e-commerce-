const Brand = require("../../models/brandSchema")
const Product = require("../../models/productSchema")
const Order = require("../../models/orderSchema")
    /**
     * Get dashboard summary stats
     */
    const getDashboardStats = async (req, res) => {
      try {
        
        const totalOrders = await Order.countDocuments();
        const cancelledOrders = await Order.countDocuments({ status: "Cancelled" });
        const pendingOrders = await Order.countDocuments({ status: "Pending" });
  
        return res.status(200).json({
          success: true,
          data: {
            totalOrders,
            cancelledOrders,
            pendingOrders
          }
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch dashboard statistics"
        });
      }
    }
  
   
   const  getSalesReport = async (req, res) => {
      try {
        let { startDate, endDate, period } = req.query;
        let dateQuery = {};
        let groupFormat;
  
        // Handle different period types
        if (startDate && endDate) {
          // Custom date range
          dateQuery = {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          };
          // Group by day for custom range
          groupFormat = "%Y-%m-%d";
        } else {
          // Calculate date range based on period
          const currentDate = new Date();
          let periodStartDate = new Date();
  
          switch (period) {
            case 'weekly':
              // Last 7 days
              periodStartDate.setDate(currentDate.getDate() - 7);
              groupFormat = "%Y-%m-%d";
              break;
            case 'monthly':
              // Last 30 days
              periodStartDate.setDate(currentDate.getDate() - 30);
              groupFormat = "%Y-%m-%d";
              break;
            case 'yearly':
              // Last 12 months
              periodStartDate.setMonth(currentDate.getMonth() - 12);
              groupFormat = "%Y-%m";
              break;
            default:
              // Default to yearly if not specified
              periodStartDate.setMonth(currentDate.getMonth() - 12);
              groupFormat = "%Y-%m";
              period = 'yearly';
          }
  
          dateQuery = {
            createdAt: {
              $gte: periodStartDate,
              $lte: currentDate
            }
          };
        }
  
        // Add status filter for completed orders only
        dateQuery.status = { $in: ["Delivered", "Ordered"] };
  
        // Aggregate sales data
        const salesData = await Order.aggregate([
          { $match: dateQuery },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: groupFormat, date: "$createdAt" } }
              },
              totalSales: { $sum: "$payableAmount" },
              orderCount: { $sum: 1 }
            }
          },
          { $sort: { "_id.date": 1 } },
          {
            $project: {
              _id: 0,
              date: "$_id.date",
              totalSales: 1,
              orderCount: 1
            }
          }
        ]);
  
        // Format response based on period type
        return res.status(200).json({
          success: true,
          data: {
            salesData,
            period
          }
        });
      } catch (error) {
        console.error("Error fetching sales report:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch sales report"
        });
      }
    }
  
    /**
     * Get best selling products or brands
     */
    const getBestSelling = async (req, res) => {
        try {
          const { type, startDate, endDate } = req.query;
          let dateQuery = {};
      
          // Set date filter if provided
          if (startDate && endDate) {
            dateQuery = {
              createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
              }
            };
          }
      
          // Add status filter for completed orders only
          dateQuery.status = { $in: ["Delivered", "Ordered"] };
      
          if (type === 'products') {
            // Get top 10 best selling products
            const bestSellingProducts = await Order.aggregate([
              { $match: dateQuery },
              { $unwind: "$products" },
              {
                $group: {
                  _id: "$products.productId",
                  totalQuantity: { $sum: "$products.quantity" },
                  totalRevenue: { $sum: "$products.totalPrice" }
                }
              },
              {
                $lookup: {
                  from: "products",
                  localField: "_id",
                  foreignField: "_id",
                  as: "productDetails"
                }
              },
              { $unwind: "$productDetails" },
              {
                $project: {
                  _id: 0,
                  productId: "$_id",
                  productName: "$productDetails.productName",
                  totalQuantity: 1,
                  totalRevenue: 1
                }
              },
              { $sort: { totalQuantity: -1 } },
              { $limit: 10 }
            ]);
      
            return res.status(200).json({
              success: true,
              data: bestSellingProducts,
              type: 'products'
            });
          } else if (type === 'brands') {
            // Get top 10 best selling brands
            const bestSellingBrands = await Order.aggregate([
              { $match: dateQuery },
              { $unwind: "$products" },
              {
                $lookup: {
                  from: "products",
                  localField: "products.productId",
                  foreignField: "_id",
                  as: "productDetails"
                }
              },
              { $unwind: "$productDetails" },
              {
                $lookup: {
                  from: "brands",
                  localField: "productDetails.brand",
                  foreignField: "_id",
                  as: "brandDetails"
                }
              },
              { $unwind: "$brandDetails" },
              {
                $group: {
                  _id: "$brandDetails._id",
                  brandName: { $first: "$brandDetails.brandName" },
                  totalQuantity: { $sum: "$products.quantity" },
                  totalRevenue: { $sum: "$products.totalPrice" }
                }
              },
              {
                $project: {
                  _id: 0,
                  brandId: "$_id",
                  brandName: 1,
                  totalQuantity: 1,
                  totalRevenue: 1
                }
              },
              { $sort: { totalQuantity: -1 } },
              { $limit: 10 }
            ]);
      
            return res.status(200).json({
              success: true,
              data: bestSellingBrands,
              type: 'brands'
            });
          } else if (type === 'categories') {
            // Get top 10 best selling categories
            const bestSellingCategories = await Order.aggregate([
              { $match: dateQuery },
              { $unwind: "$products" },
              {
                $lookup: {
                  from: "products",
                  localField: "products.productId",
                  foreignField: "_id",
                  as: "productDetails"
                }
              },
              { $unwind: "$productDetails" },
              {
                $lookup: {
                  from: "categories",
                  localField: "productDetails.category", // Assuming your product schema has a category field
                  foreignField: "_id",
                  as: "categoryDetails"
                }
              },
              { $unwind: "$categoryDetails" },
              {
                $group: {
                  _id: "$categoryDetails._id",
                  categoryName: { $first: "$categoryDetails.name" }, // Using the name field from your category schema
                  totalQuantity: { $sum: "$products.quantity" },
                  totalRevenue: { $sum: "$products.totalPrice" }
                }
              },
              {
                $project: {
                  _id: 0,
                  categoryId: "$_id",
                  categoryName: 1,
                  totalQuantity: 1,
                  totalRevenue: 1
                }
              },
              { $sort: { totalQuantity: -1 } },
              { $limit: 10 }
            ]);
      
            return res.status(200).json({
              success: true,
              data: bestSellingCategories,
              type: 'categories'
            });
          } else {
            return res.status(400).json({
              success: false,
              message: "Invalid type specified. Use 'products', 'brands', or 'categories'"
            });
          }
        } catch (error) {
          console.error("Error fetching best selling items:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to fetch best selling items"
          });
        }
      };

    module.exports = {
        getBestSelling,
        getDashboardStats,
        getSalesReport
    }
  