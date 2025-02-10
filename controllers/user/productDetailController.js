const User = require("../../models/userSchema")
const Product = require("../../models/productSchema")
const Brand = require("../../models/brandSchema")
const Category = require("../../models/categorySchema")
// const { findById } = require("../../models/variantSchema")


const productDetail = async (req,res)=>{
    try {
        const id = req.params.id
        const user = req.session.user
        console.log("product id",id)
        const allProduct = await Product.find({isBlocked:false})
        const productData = await Product.findOne({ _id: id, isBlocked:false})
        .populate("brand")
        .populate("category")
        if (!productData) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.render("productdetail",{
            productData,
            user,
            allProduct
        })
    } catch (error) {
        console.error("Error from product detail page", error)
        res.redirect("/pageerror")
    }
}

module.exports = {
    productDetail
}