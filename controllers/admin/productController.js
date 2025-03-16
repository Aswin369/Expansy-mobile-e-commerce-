const express = require("express")
const Product = require("../../models/productSchema")
const Category = require("../../models/categorySchema")
const Brand = require("../../models/brandSchema")
const Variant = require("../../models/variantSchema")
const User = require("../../models/userSchema")
const {handleUpload } = require("../../config/cloudinary")
const streamifier = require("streamifier");
const { json } = require("body-parser")

const getProductAddPage = async (req,res)=>{
    try {
        const category = await Category.find({isListed:true})
        const brand = await Brand.find({isBlocked:false})
        const ram = await Variant.find({category:"Ram", isBlocked:false})
        const storage = await Variant.find({category:"Storage",isBlocked:false})
        const color = await Variant.find({category:"Color", isBlocked:false})
        res.render("product-add",{
            category:category,
            brand:brand,
            storage:storage,
            ram:ram,
            color:color
        })
        
    } catch (error) {
        res.redirect("/pageerror")
    }
}

const addProducts = async (req, res) => {
    try {
        const {productName, description, processor, brand, productCategories, battery, displaySize, variants} = req.body;
        
        const brandId = await Brand.findOne({
            brand:brand._id
        })

        if(!brand){
            return res.status(400).json({
                success:false,
                message:"Brand is not exists"
            })
        }
        
        
        const categoryId = await Category.findOne({
            category:productCategories._id
        })
       
        
        if(!categoryId){
            return res.status(400).json({
                success:false,
                message: "Category is not exists"
            })
        }

        const variant = typeof variants  === "string" ? JSON.parse(variants) : variants

        console.log("VAriat typof", typeof variant)

        console.log("This is parsed variant", variant)
        
        const specification = variant.map(items=>({
            ram: items.ram.id,
            storage: items.storage.id,
            color: items.color.id,
            quantity:items.quantity,
            regularPrice: items.regularPrice,
            salePrice:items.salePrice
        }))
        const imagePaths = [];
            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    const b64 = Buffer.from(req.files[i].buffer).toString("base64");
                    let dataURI = "data:" + req.files[i].mimetype + ";base64," + b64;
                    const cldRes = await handleUpload(dataURI)
                    imagePaths.push(cldRes.secure_url)
                }
            }

        const newProduct = new Product({
            productName:productName,
            description:description,
            brand:brandId,
            category:categoryId,
            battery:battery,
            displaySize:displaySize,
            processor:processor,
            status:"Available",
            specification: specification,
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
        const search = req.query.search ? req.query.search.trim() : "";
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
       
        const message = req.message

        const productData = await Product.find({
            productName: { $regex: new RegExp(".*" + search + ".*", "i") }  
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate("category")
        .populate("brand")
        .exec();

       

        const count = await Product.countDocuments({
            productName: { $regex: new RegExp(".*" + search + ".*", "i") } 
        });

      
        const category = await Category.find({ isListed: true })
        const brand = await Brand.find({ isBlocked: false })

      
        res.render("products", {
            data: productData,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            category: category,
            brand: brand,
            message:message
        });

    } catch (error) {

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
        
        const product = await Product.findOne({ _id: id })
        .populate({path: "specification.ram",model: 'Variant'})
        .populate({path: "specification.storage", model: "Variant"})
        .populate({path: "specification.color", model:"Variant"})
        const ram = await Variant.find({category:"Ram", isBlocked:false})
        const storage = await Variant.find({category:"Storage",isBlocked:false})
        const color = await Variant.find({category:"Color", isBlocked:false})
        

        const category = await Category.find({});
        const brand = await Brand.find({});

        if (!product) {
            return res.redirect("/admin/products"); 
        }

        res.render("product-edit", {
            product: product,
            category: category,
            brand: brand,
            ram:ram,
            storage:storage,
            color:color
        });
    } catch (error) {
        console.error('Get edit product error:', error);
        res.redirect("/pageerror");
    }
}

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

        return res.json({
            message:"Image updated successfully",
            Image:result.secure_url
        })

    } catch (error) {
        console.error("Error updating image:",error)
        return res.status(500).json({
            error: "Failed to update image",
            details:error.message
        })
    }
}

const updateForm = async (req,res)=>{
    try {
        const id = req.params.productId
        console.log("update form id", id);
        if(!id){
            return res.status(400).json({message:"Product id not found"})
        }

        const {name,
            description,
            quantity,
            RAM,
            processor,
            storage,
            brand,
            category,
            regularPrice,
            salePrice,
            color} = req.body

            console.log("request body is ", req.body)

        const productData = await Product.updateOne({_id:id},{
            $set:{productName:name,
                description:description,
                brand:brand,
                category:category,
                regularPrice:regularPrice,
                salePrice:salePrice,
                quantity:quantity,
                color:color,
                ram:RAM,
                storage:storage,
                processor:processor
            }})
            
            return res.json({
                message:"Product updated successfully"
            })

    } catch (error) {
        console.error("error form validate form",error)
        return res.status(500).json({
            message:"Internal server error"
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
        
        res.render("product-details", {
            productDetails,
            brandcategory
        });

    } catch (error) {
        console.error('Product Info error:', error);
        res.redirect("/pageerror");
    }
}

const updateStocks = async(req,res)=>{
    try {
        const id = req.params.productId
        console.log("this req.body",req.body)
        console.log("This is dsjk", id)

        const {ram, storage, color, quantity, regularPrice, salePrice} = req.body

        const stocksObject = {
            ram:ram,
            storage: storage,
            color: color,
            quantity: quantity,
            regularPrice: regularPrice,
            salePrice:salePrice,
        }

        await Product.findByIdAndUpdate(id,{$push:{specification:stocksObject}})
        
        res.status(201).json({success:true, message:"Added successfull"})
        console.log("1");
        
    } catch (error) {
        console.error("This error occurred in updateStocks function",error)
        res.redirect("/pageerror")
    }
}

const deleteVariantEditProduct = async (req,res)=>{
    try {
        
        const {variantId, productId} = req.body
        if(!variantId || !productId){
            return res.status(400).json({success:false, message:"Please try again"})
        }
        
        await Product.findByIdAndUpdate(productId,{$pull:{"specification":{_id:variantId}}})
        res.status(201).json({success:true})
        console.log("1")
    } catch (error) {
        console.error("This error occured in deleteVariantEditProduct",error)
        res.redirect("/pageerror")
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
    viewProduct,
    updateForm,
    updateStocks,
    deleteVariantEditProduct
}