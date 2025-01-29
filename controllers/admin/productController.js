const express = require("express")
const Product = require("../../models/productSchema")
const Category = require("../../models/categorySchema")
const Brand = require("../../models/brandSchema")
const fs = require("fs")
const path = require("path")
const User = require("../../models/userSchema")
const sharp = require("sharp")

const getProductAddPage = async (req,res)=>{
    try {
        const category = await Category.find({isListed:true})
        const brand = await Brand.find({isBlocked:false})
        res.render("product-add",{
            category:category,
            brand:brand
        })
        
    } catch (error) {
        res.redirect("/pageerror")
    }
}

const addProducts = async (req,res)=>{
    try {
        const {productName, category} = req.body
        console.log("productname",productName);
        console.log("fdsgsdgf",category);

        
        

       
        if(!productExists){
            const images = []
            if(req.files && req.files.length>0){
                for(let i=0; i<req.files.length;i++){
                    const b64 = Buffer.from(req.file[i].buffer).toString("base64");
                    let dataURI = "data:" + req.file[i].mimetype + ";base64," + b64;
                    const cldRes = await handleUpload(dataURI);
                    newProducts.images = cldRes.secure_url;
                }
            }
            const categoryId = await Category.findOne({name:products.category})
            if(!categoryId){
                return res.status(400).json("Invalid category name")
            }

            const newProducts = new Product({
                productName:products.productName,
                description:products.description,
                brand:products.brand,
                category:categoryId._id,
                regularPrice:products.regularPrice,
                salePrice:products.salePrice,
                createdAt:new Date(),
                quantity:products.quantity,
                color:products.color,
                ram:products.ram,
                processor:products.processor,
                status: "Available"
                
            })
            await newProducts.save()
            return res.redirect("/admin/addProducts")
        }else{
            return res.status(400).json("Products already exists, please try with another name")
        }
    } catch (error) {
        console.error("Error saving product")
        return res.redirect("/admin/pageerror")
    }
}

module.exports = {
    getProductAddPage,
    addProducts
}