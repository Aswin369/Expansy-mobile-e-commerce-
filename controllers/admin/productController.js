const express = require("express")
const Product = require("../../models/productSchema")
const Category = require("../../models/categorySchema")
const Brand = require("../../models/brandSchema")
const fs = require("fs")
const path = require("path")
const User = require("../../models/userSchema")
const sharp = require("sharp")
const {handleUpload } = require("../../config/cloudinary")
const streamifier = require("streamifier");

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

const addProducts = async (req, res) => {
    try {
        const {productName, category, brand, quantity, regularPrice, salePrice, description, ram, storage, processor, color} = req.body;
        
        
        
        // Check if product already exists
        const productExists = await Product.findOne({
            productName: productName.productName
        });
        
        if (productExists) {
            return res.status(400).json({
                success: false,
                message: 'Product already exists'
            });
        }

        // Handle file uploads to Cloudinary
        
        

        const imagePaths = [];

        if (req.files && Object.keys(req.files).length > 0) {
            // Loop through each field name in req.files (like 'product-image-1', 'product-image-2', etc.)
            for (const key in req.files) {
                // Loop through each file in the array for the current field (key)
                for (const file of req.files[key]) {
                    try {
                        // Convert the file buffer to a base64 string
                        const b64 = Buffer.from(file.buffer).toString("base64");
                        const dataURI = `data:${file.mimetype};base64,${b64}`;
                        
                        // Upload to Cloudinary
                        const cldRes = await handleUpload(dataURI);
                        
                        // Push the secure URL to imagePaths
                        if (cldRes && cldRes.secure_url) {
                            imagePaths.push(cldRes.secure_url);
                        } else {
                            throw new Error('Failed to upload image');
                        }
                    } catch (error) {
                        console.error('Error uploading image:', error);
                        return res.status(400).json({
                            success: false,
                            message: 'Error uploading images',
                            error: error.message
                        });
                    }
                }
            }
        }
        

      
      
        
        // Create new product with uploaded image URLs
        const newProduct = new Product({
            productName:productName,
            description:description,
            category:category,
            brand:brand,
            quantity:quantity,
            regularPrice:regularPrice,
            salePrice:salePrice,
            ram:ram,
            storage:storage,
            processor:processor,
            color:color,
            status:"Available",
            date: Date.now(),
            productImage: imagePaths
        });

        
        
        await newProduct.save();
        

        return res.status(201).json({
            success: true,
            message: 'Product added successfully',
            product: newProduct
        });

    } catch (error) {
        console.error('Error adding product:', error);
        return res.status(500).json({
            success: false,
            message: 'Error adding product',
            error: error.message
        });
    }
};

module.exports = {
    getProductAddPage,
    addProducts
}