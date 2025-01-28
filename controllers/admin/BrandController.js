const { query } = require("express")
const Brand = require("../../models/brandSchema")
const product = require("../../models/productSchema")



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
        const { brandName, croppedImageData } = req.body;
        console.log("brand Name", brandName);
        console.log("cropped Image Data", croppedImageData);
        
        
        // Validate brand name
        // if (!brandName) {
        //     return res.status(400).json({
        //         status: 'error',
        //         message: 'Brand name is required!'
        //     });
        // }

        // Check if brand already exists (case-insensitive)
        // const findBrand = await Brand.findOne({ 
        //     brandName: { $regex: new RegExp(`^${brandName}$, 'i'`) }
        // });
        
        // if (findBrand) {
        //     return res.status(400).json({
        //         status: 'error',
        //         message: 'Brand already exists!'
        //     });
        // }

        // Validate if image was uploaded
        // if (!req.files || !req.files.image) {
        //     return res.status(400).json({
        //         status: 'error',
        //         message: 'Brand image is required!'
        //     });
        // }

        // Upload image to Cloudinary
        // const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        //     folder: 'brands',
        //     allowed_formats: ['jpg', 'jpeg', 'png'],
        //     transformation: [
        //         { width: 500, height: 500, crop: 'limit' } // Add size limits if needed
        //     ]
        // });

        // Create new brand
        // const newBrand = new Brand({
        //     brandName: brandName,
        //     image: result.secure_url,
        //     cloudinaryId: result.public_id,
        //     status: true,
        //     createdAt: new Date()
        // });

        // await newBrand.save();

        // return res.status(200).json({
        //     status: 'success',
        //     message: 'Brand added successfully!'
        // });
    } catch (error) {
        console.error('Error in addBrand:', error);
        return res.status(500).json({
            status: 'error',
            message: 'An error occurred while adding the brand.'
        });
    }
};

module.exports = {
    getBrandPage,
    addBrand
}