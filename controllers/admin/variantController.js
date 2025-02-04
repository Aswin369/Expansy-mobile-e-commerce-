const express = require("express")
const Variant = require("../../models/variantSchema")


const getVariantList = async (req,res)=>{
    try {
        res.render("variant")
    } catch (error) {
        console.error("Error in gettingVariant Page",error)
        res.redirect("/pageerror")
    }
}

module.exports = {
    getVariantList
}