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
        const {productName, productCategories, brand, quantity, regularPrice, salePrice, description, ram, storage, processor, color, Stocks} = req.body;
        
        // console.log(req.body)
        // console.log("request body is printing",req.body)

        const brandId = await Brand.findOne({
            brand:brand._id
        })

        // console.log("brand id ",brandId)
        
        if(!brand){
            return res.status(400).json({
                success:false,
                message:"Brand is not exists"
            })
        }
        
        
        const categoryId = await Category.findOne({
            category:productCategories._id
        })
        // console.log("category id ",categoryId)
        
        if(!categoryId){
            return res.status(400).json({
                success:false,
                message: "Category is not exists"
            })
        }
       

    
        const imagePaths = [];
        
       

            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    const b64 = Buffer.from(req.files[i].buffer).toString("base64");
                    let dataURI = "data:" + req.files[i].mimetype + ";base64," + b64;
                    const cldRes = await handleUpload(dataURI)
                    imagePaths.push(cldRes.secure_url)
                }
            }

// console.log("Images ",imagePaths);


        const newProduct = new Product({
            productName:productName,
            description:description,
            category:categoryId._id,
            brand:brandId._id,
            quantity:quantity,
            stockes:Stocks,
            regularPrice:regularPrice,
            salePrice:salePrice,
            ram:ram,
            storage:storage,
            processor:processor,
            color:color,
            status:"Available",
            productImage: imagePaths
        });

        // console.log("Now product detail checking properly",newProduct)
        
        await newProduct.save();
        
        console.log("Saved conformed")

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
        

        const search = req.query.search ? req.query.search.trim() : "";
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        // console.log("2");
        const message = req.message

        const productData = await Product.find({
            productName: { $regex: new RegExp(".*" + search + ".*", "i") }  
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate("category")
        .populate("brand")
        .exec();

        // console.log("this is product data", productData)
        // console.log("Page is not rendering");

        const count = await Product.countDocuments({
            productName: { $regex: new RegExp(".*" + search + ".*", "i") } 
        });

        // console.log("3")
        const category = await Category.find({ isListed: true })
        const brand = await Brand.find({ isBlocked: false })
        // console.log("this is brand",brand)
        // console.log("category", category )
      
        res.render("products", {
            data: productData,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            category: category,
            brand: brand,
            message:message
        });

    } catch (error) {
        // console.log("page error");
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

const updateImage = async (req,res)=>{
    try {
        const id = req.params.productId
        const imageIndex = req.body.index;
        
        if(!req.file){
            return res.status(400).json({error: "No image file provided"})
        }

        const productData = await Product.findById({_id:id})
        if(!productData){
            return res.status(404).json({error:"Product not found"})
        }
        
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const result = await handleUpload(dataURI);
        console.log("result image is ",result )
        productData.productImage[imageIndex] = result.secure_url
        console.log("1")
        await productData.save()
        console.log("2")

        res.json({
            message:"Image updated successfully",
            Image:result.secure_url
        })

    } catch (error) {
        console.error("Error updating image:",error)
        res.status(500).json({
            error: "Failed to update image",
            details:error.message
        })
    }
}



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
        // console.log(productDetails);
        // console.log("brand adn vategory",brandcategory)
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
    updateImage,
    getEditProduct,
    viewProduct
}