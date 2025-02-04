const express = require("express")
const Variant = require("../../models/variantSchema")


const getVariantList = async (req,res)=>{
    try {
        cosnt variantData = await 
    } catch (error) {
        console.error("Error in gettingVariant Page",error)
        res.redirect("/pageerror")
    }
}

const getAddVariant = async (req,res)=>{
    try {
        res.render("addVariant")
    } catch (error) {
        console.error("Error found in getAddVariant", error)
        res.redirect("/pageerror")
    }
}

const addVariants = async (req,res)=>{
    try {
        const {variantType, variantValue, variantPrice} = req.body
        if(!variantType || !variantValue || !variantPrice){
            return res.status(400).json({message:"variantType, VariantValue and VariantPrice are required"})
        }

        const newVariant = new Variant({
            category:variantType,
            value:variantValue,
            price:variantPrice
        })

        console.log("new is going to add",newVariant)
        console.log("1")
        await newVariant.save()
        return res.json({message: "Variant is added successfully"})
        console.log("2 addedd")
    } catch (error) {
        console.error("Error in add variant",error)
        res.redirect("/pageerror")
    }
}

module.exports = {
    getVariantList,
    addVariants,
    getAddVariant
}