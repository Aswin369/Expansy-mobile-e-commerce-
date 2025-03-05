const Product = require('../../models/productSchema')
const Category = require("../../models/categorySchema")
const Offer = require("../../models/offerSchema")


const getOfferList = async (req,res)=>{
    try {

        const page = parseInt(req.query.page) || 1
        const limit = 4
        const skip = (page - 1)*limit
        const offerData = await Offer.find({})
        .populate({path:"applicableProducts",select: "productName"})
        .populate({path: "applicableCategories",select: "name"})
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)

        const totalOffers = await Offer.countDocuments()

        const totalPages = Math.ceil(totalOffers/limit)
        res.render("offerList",{
            data:offerData,
            currentPage: page,
            totalPages: totalPages,
            totalOffers: totalOffers
        })
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

const banOffer = async(req,res)=>{
    try {
        console.log("asdkfjas",req.params.id)
        const offerId = req.params.id
        if(!offerId){
            res.redirect("/pageerror")
        }
        const updatedOffer = await Offer.findOneAndUpdate({_id:offerId},{$set:{isActive:false}},{new:true})
        console.log("skafh")
        if(!updatedOffer){
            res.redirect("/pageerror")
        }
        res.redirect("/admin/getOfferList")

    } catch (error) {
        console.error("This error occured in banOffer", banOffer)
        res.redirect("/pageerror")
    }
}

const unBanOffer = async (req,res)=>{
    try {
        const offerId = req.params.id
        if(!offerId){
            res.redirect("/pageerror")
        }
        const offerData = await Offer.findOneAndUpdate({_id:offerId},{$set:{isActive:true}},{new:true})
        if(!offerData){
            res.redirect("/pageerror")
        }
        res.redirect("/admin/getOfferList")
    } catch (error) {
        console.error("This error occured in unBanOffer",error)
        res.redirect("/pageerror")
    }
}

const getEditOffer = async (req,res)=>{
    try {
        const offerId = req.params.id
        console.log("sdafasdfasgsdfgsdfg",offerId)
        if(!offerId){
            res.redirect("/pageerror")
        }
        const offerData = await Offer.findOne({_id:offerId})
        const productData = await Product.find({isBlocked:false})
        const categoryData = await Category.find({isListed:true})
        console.log("offerdatea",offerData)
        if(!offerData){
            res.redirect("/pageerror")
        }
        res.render("offerEdit",{
            offerData,
            productData,
            categoryData
        })
    } catch (error) {
        console.error("This error occured in getEditOffer",error)
        res.redirect("/pageerror")
    }
}

const editOffer = async (req,res)=>{
    try {
        console.log("req.bodyasfd", req.body);
        const { start_date, end_date, offer_name, offer_type, offer_item, description, discount_value, offerId } = req.body;
        if (!offerId) {
            return res.status(400).json({ success: false, message: "Cannot find offerId" });
        }
        const updateData = {
            offerName: offer_name,
            description: description,
            discountValue: discount_value,
            applicableTo: offer_type,
            startDate: start_date,
            expirationDate: end_date,
        }

        if (offer_type === "product") {
            updateData.applicableProducts = offer_item 
            const updateProductOffer = await Product.findByIdAndUpdate({_id:offer_item},{$set:{productOffer:discount_value}},{new:true})
            if(!updateProductOffer){
                res.status(400).json({success:true, message:"Product not found select another product"})
            }
            updateData.applicableCategories = null
        } else if (offer_type === "category") {
            updateData.applicableCategories = offer_item 
            const updateCategoryOffer = await Category.findByIdAndUpdate({_id:offer_item},{$set:{productOffer:discount_value}},{new:true})
            if(!updateCategoryOffer){
                res.status(400).json({success:true, message:"Category not found select another product"})
            }
            updateData.applicableProducts = null 
        }

        const updatedOffer = await Offer.findOneAndUpdate({_id: offerId },{$set: updateData},{new:true})
        if(!updatedOffer){
            res.status(400).json({success:false, message:"Not update please try again"})
        }
        res.status(200).json({success:true})
    } catch (error) {
        console.error("This error occured in editOffer",error)
        res.redirect("/pageerrror")
    }
}

module.exports = {
    getOfferList,
    getCreateOffer,
    createOffer,
    banOffer,
    unBanOffer,
    getEditOffer,
    editOffer
}