const express = require("express")
const Product = require("../../models/productSchema")
const Brand = require("../../models/brandSchema")
const Category = require("../../models/categorySchema")

const getShopPage = async (req, res) => {
    try {
        const user = req.session.user
        const page = parseInt(req.query.page) || 1;
        const limit = 18;
        const skip = (page - 1) * limit;
        const brandName = req.query.brand || null;

        let query = { isBlocked: false };

        if (brandName && brandName !== "All") {
            const brand = await Brand.findOne({ brandName: { $regex: new RegExp("^" + brandName + "$", "i")}})
            if (!brand) {
                
                return res.json({ 
                    products: [],  
                    message: `No products found for brand: ${brandName}`,
                    currentPage: page, 
                    totalProducts: 0, 
                    totalPages: 0 
                });
            }

            query.brand = brand._id;
        }

        const productData = await Product.find(query)
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .populate("brand");

        const totalProducts = await Product.countDocuments(query)
        const totalPages = Math.ceil(totalProducts / limit)

        if (req.headers.accept && req.headers.accept.includes("application/json")) {
            return res.json({
                products: productData,
                message: productData.length === 0 ? `No products found for brand: ${brandName}` : "",
                currentPage: page,
                totalProducts: totalProducts,
                totalPages: totalPages
            });
        }

        
        res.render("shop-page", {
            user:user,
            product: productData,
            currentPage: page,
            totalProducts: totalProducts,
            totalPages: totalPages
        });

    } catch (error) {
        console.error("Error loading shop page:", error)
        res.status(500).json({ message: "Server error" })
    }
};

const getProducts = async (req, res) => {
    try {
        let { sort } = req.query;

       
        let sortOption = {};
        if (sort === "az") {
            sortOption = { productName: 1 }
        } else if (sort === "za") {
            sortOption = { productName: -1 }
        } else if (sort === "new") {
            sortOption = { createdAt: -1 }
        }

     
        let products = await Product.find({ isBlocked: false })
            .populate("category specification.ram specification.storage specification.color")
            .sort(sortOption);

        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ message: "Server error", error })
    }
};

const getFilteredProducts = async (req, res) => {
    try {
        let filter = {}

        if (req.query.minPrice && req.query.maxPrice) {
            filter["specification.salePrice"] = { 
                $gte: Number(req.query.minPrice), 
                $lte: Number(req.query.maxPrice) 
            };
        } else if (req.query.minPrice) {
            filter["specification.salePrice"] = { $gte: Number(req.query.minPrice) }
        }

        
        const products = await Product.find(filter)
            .populate({
                path: "specification.ram specification.storage specification.color",
                model: "Variant"
            });

        res.status(200).json({ success: true, products })
    } catch (error) {
        console.error("Error fetching filtered products:", error)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
};


const getFilteredProductsByCategory = async (req, res) => {
    try {
        const categoryName = req.query.category;

       
        const category = await Category.findOne({ name: categoryName})

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" })
        }

        
        const products = await Product.find({ category: category._id })
            .populate("specification.ram")
            .populate("specification.storage")
            .populate("specification.color");;

        res.status(200).json({ success: true, products })
    } catch (error) {
        console.error("Error fetching filtered products by category:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
};


const searchProducts = async (req, res) => {
    try {
       

        const productName = req.query.productName?.trim() || "";

       
        const products = await Product.find({
            productName: { $regex: productName, $options: "i" },
            isBlocked: false
        }).populate("brand category specification.ram specification.storage specification.color")

        

        res.json({ success: true, products })
    } catch (error) {
        console.error("Error searching products:", error)
        res.status(500).json({ success: false, message: "Internal Server Error"})
    }
};

module.exports = {
    getShopPage,
    getProducts,
    getFilteredProducts,
    getFilteredProductsByCategory,
    searchProducts
}
