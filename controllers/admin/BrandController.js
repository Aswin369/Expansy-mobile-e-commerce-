const { query } = require("express")
const Brand = require("../../models/brandSchema")
const product = require("../../models/productSchema")
const {handleUpload} = require("../../config/cloudinary")


const getBrandPage = async (req, res) => {
    try {
        // Correct the way you access `req.query.page`
        const page = parseInt(req.query.page) || 1; 
        const limit = 4;
        const skip = (page - 1) * limit;

        // Fetch the brands with pagination
        const brandData = await Brand.find({})
            .sort({ createdAt: -1 }) // Sort by `createdAt` in descending order
            .skip(skip)
            .limit(limit);

        // Count the total number of brands
        const totalBrands = await Brand.countDocuments();

        // Calculate total pages for pagination
        const totalPages = Math.ceil(totalBrands / limit);

        // Render the `brands` page and pass all necessary data
        res.render("brands", {
            data: brandData, // Send `brandData` directly without reversing
            currentPage: page,
            totalPages: totalPages,
            totalBrands: totalBrands,
        });
    } catch (error) {
        console.error("Error in getBrandPage:", error); // Log the error for debugging
        res.redirect("/pagerror");
    }
};


const addBrand = async (req, res) => {
    try {
        
    } catch (error) {
    
    }
};

module.exports = {
    getBrandPage,
    addBrand
}