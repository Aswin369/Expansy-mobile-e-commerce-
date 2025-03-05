const Product = require('../../models/productSchema')
const Category = require("../../models/categorySchema")
const Offer = require("../../models/offerSchema")


const getOfferList = async (req,res)=>{
    try {
        res.render("offerList")
    } catch (error) {
        console.error("This error occured in getOfferList",error)
        res.redirect("/pageerror")
    }
}

const getCreateOffer = async (req,res)=>{
    try {
        const productData = await Product.find({isBlocked:false})
        const categoryData = await Category.find({isListed:true})
        res.render("offerAdd",{
            productData,
            categoryData
        })
    } catch (error) {
        console.error("This error occured in getCreatOffer",error)
        res.redirect("/pageerror")
    }
}

const createOffer = async(req,res)=>{
    try {
        console.log("thsdjkf",req.body)
        const {start_date, end_date, offer_name, offer_type, offer_item, description, discount_value} = req.body

        const offerData = new Offer({
            offerName: offer_name,
            startDate: start_date,
            expirationDate: end_date,
            discountValue: discount_value,
            description: description,
            applicableTo: offer_type,  
        });
         
        if (offer_type === "product") {
            offerData.applicableProducts = offer_item
            console.log("productOffer")
            const productOffer = await Product.findOneAndUpdate({_id:offer_item},{$set:{productOffer:discount_value}})
            console.log("productOffer saved")
            if(!productOffer){
                res.status(400).json({success:false, message: "Product not found"})
            }

        } else if (offer_type === "category") {
            offerData.applicableCategories = offer_item
            console.log("categoryOffer")
            const categoryOffer = await Category.findOneAndUpdate({_id:offer_item},{$set:{categoryOffer:discount_value}})
            console.log("categoryOffer saved")
            if(!categoryOffer){
                res.status(400).json({success:false, message: "Category not found"})
            }
        }
        console.log("skdhf")
        await offerData.save()
        console.log("saved")
        res.status(201).json({success:true})
    } catch (error) {
        console.error("This error occured in createOffer",error)
        res.redirect("/pageerror")
    }
}

module.exports = {
    getOfferList,
    getCreateOffer,
    createOffer
}