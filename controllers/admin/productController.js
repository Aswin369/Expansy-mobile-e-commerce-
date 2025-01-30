const express = require("express")
const Product = require("../../models/productSchema")
const Category = require("../../models/categorySchema")
const Brand = require("../../models/brandSchema")
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
        
        const brandId = await Brand.findOne({
            category:category._id
        })
        
        if(!brand){
            return res.status(400).json({
                success:false,
                message:"Brand is not exists"
            })
        }


        const categoryId = await Category.findOne({
            category:category._id
        })
        
        if(!categoryId){
            return res.status(400).json({
                success:false,
                message: "Category is not exists"
            })
        }
        
        const productExists = await Product.findOne({
            productName: productName.productName
        });

        if (productExists) {
            return res.status(400).json({
                success: false,
                message: 'Product already exists'
            });
        }


        
        const imagePaths = [];

        if (req.files && Object.keys(req.files).length > 0) {
            for (const key in req.files) {
                for (const file of req.files[key]) {
                    try {
                        const b64 = Buffer.from(file.buffer).toString("base64");
                        const dataURI = `data:${file.mimetype};base64,${b64}`;
                        const cldRes = await handleUpload(dataURI);
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
        const newProduct = new Product({
            productName:productName,
            description:description,
            category:categoryId._id,
            brand:brandId._id,
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


const getAllProducts = async (req, res) => {
    try {
        console.log("1");

        const search = req.query.search ? req.query.search.trim() : "";
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        console.log("2");
        const message = req.message

        const productData = await Product.find({
            productName: { $regex: new RegExp(".*" + search + ".*", "i") }  
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate("category")
        .populate("brand")
        .exec();

        console.log("Page is not rendering");

        const count = await Product.countDocuments({
            productName: { $regex: new RegExp(".*" + search + ".*", "i") } 
        });

        console.log("3")
        const category = await Category.find({ isListed: true })
        const brand = await Brand.find({ isBlocked: false })
        console.log("5");
        res.render("products", {
            data: productData,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            category: category,
            brand: brand,
            message:message
        });

    } catch (error) {
        console.log("page error");
        console.error("Error in getAllProducts:", error);
        res.redirect("/pagerror");
    }
};

const blockProduct = async (req, res) => {
    try {
        const id = req.params.id; 

        await Product.updateOne({ _id: id },{ $set: { isBlocked: true, status: "Discontinued"}});

        res.redirect("/admin/products");
    } catch (error) {
        console.error("Error blocking product:", error);
        res.redirect("/pageerror");
    }
};

const UnBlockProduct = async (req, res) => {
    try {
        const id = req.params.id;

        await Product.updateOne({ _id: id },{ $set: { isBlocked: false, status: "Available"}});

        res.redirect("/admin/products");
    } catch (error) {
        console.error("Error unblocking product:", error);
        res.redirect("/pageerror");
    }
};

const getEditProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findOne({ _id: id });
        const category = await Category.find({});
        const brand = await Brand.find({});

        if (!product) {
            return res.redirect("/admin/products"); 
        }

        res.render("product-edit", {
            product: product,
            category: category,
            brand: brand
        });
    } catch (error) {
        console.error('Get edit product error:', error);
        res.redirect("/pageerror");
    }
};

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const {productName,category,
            brand,
            quantity,
            regularPrice,
            salePrice,
            description,
            ram,
            storage,
            processor,
            color
        } = req.body;

       
        if (!productName || !category || !brand || !quantity || !regularPrice) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        
        let productImages = [];
        if (req.files) {
            for (let i = 0; i < Object.keys(req.files).length; i++) {
                const imageKey = `productImage-${i}`;
                if (req.files[imageKey]) {
                    
                    const imageUrl = await uploadImage(req.files[imageKey]);
                    productImages.push(imageUrl);
                }
            }
        }

        
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        
        const finalImages = productImages.length > 0 ? productImages : existingProduct.productImage;

        
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                productName,
                category,
                brand,
                quantity,
                regularPrice,
                salePrice,
                description,
                ram,
                storage,
                processor,
                color,
                productImage: finalImages
            },
            { new: true }
        );

        
        return res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct,
            redirectUrl: '/admin/products' 
        });

    } catch (error) {
        console.error('Update product error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update product'
        });
    }
};

const viewProduct = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.redirect("/admin/products");
        }
        const productDetails = await Product.findById(id);
        if (!productDetails) {
            return res.redirect("/pageerror"); 
        }
        const brandcategory = await Product.findById(id)
            .populate('brand', 'brandName')
            .populate('category', 'name');
        console.log(productDetails);
        console.log("brand adn vategory",brandcategory)
        res.render("product-details", {
            productDetails,
            brandcategory
        });

    } catch (error) {
        console.error('Product Info error:', error);
        res.redirect("/pageerror");
    }
}


module.exports = {
    getProductAddPage,
    addProducts,
    getAllProducts,
    blockProduct,
    UnBlockProduct,
    updateProduct,
    getEditProduct,
    viewProduct
}