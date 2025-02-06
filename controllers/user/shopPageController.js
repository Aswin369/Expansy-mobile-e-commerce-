const express = require("express")
const Product = require("../../models/productSchema")
const Brand = require("../../models/brandSchema")
const Category = require("../../models/categorySchema")


const getShopPage = async (req,res)=>{
    try {

        const page = parseInt(req.query.page) || 1
        const limit = 18
        const skip = (page - 1) * limit



        const productData = await Product.find({isBlocked:false})
        .sort({createdAt:1})
        .skip(skip)
        .limit(limit)

        const totalProducts = await Product.countDocuments({isBlocked:false})
        const totalPages = Math.ceil(totalProducts/limit)

        res.render("shop-page",{
            product:productData,
            currentPage: page,
            totalProducts:totalProducts,
            totalPages:totalPages
        })

    } catch (error) {
        console.error("Error loading home page:",error)
        res.status(500).send("Server error")
    }
}

module.exports = {
    getShopPage
}
