const { query } = require("express")
const Brand = require("../../models/brandSchema")
const product = require("../../models/productSchema")
const {handleUpload} = require("../../config/cloudinary")


const getBrandPage = async (req, res) => {
    try {
        
        const page = parseInt(req.query.page) || 1; 
        const limit = 4;
        const skip = (page - 1) * limit;

       
        const brandData = await Brand.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        
        const totalBrands = await Brand.countDocuments();

        const totalPages = Math.ceil(totalBrands / limit);

        res.render("brands", {
            data: brandData, 
            currentPage: page,
            totalPages: totalPages,
            totalBrands: totalBrands,
            

        });
    } catch (error) {
        console.error("Error in getBrandPage:", error); 
        res.redirect("/pagerror");
    }
};


const addBrand = async (req, res) => {
        try {
            const brand = req.body.brandName;
            console.log(brand)
            const findBrand = await Brand.findOne({ brandName: brand });
    
            if (findBrand) {
                return res.status(400).json({ message: "Brand already exists" });
            }
    
            
            const newBrand = new Brand({ brandName: brand });
    
           
            if (req.file) {
                const b64 = Buffer.from(req.file.buffer).toString("base64");
                let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
                const cldRes = await handleUpload(dataURI);
                console.log(cldRes)
                newBrand.brandImage = cldRes.secure_url; 
            }
            console.log(newBrand) 
            await newBrand.save();
            console.log("Hello")
            return res.json({ message: "Brand added successfully" });
        } catch (error) {
            console.error("Error adding brand:", error.message);
            return res.status(500).json({ error: "Internal server error" });
        }
    };
    
const blockBrand = async (req,res)=>{
    try {
        const id = req.query.id
        console.log(id)
        await Brand.updateOne({_id:id},{$set:{isBlocked:true}})
        res.redirect("/admin/brands")
    } catch (error) {
        res.redirect("/pageerror")
    }
}

const unBlockBrand = async (req, res)=>{
    try {
        const id = req.query.id
        await Brand.updateOne({_id:id},{$set:{isBlocked:false}})
        res.redirect("/admin/brands")
    } catch (error) {
        res.redirect("/pageerror")
    }
}

const getEditBrand = async (req, res) => {
    try {
    const id = req.query.id
    const brand = await Brand.findOne({_id:id})
    res.render("brand-edit",{brand:brand})
    console.log(brand)
    } catch (error) {
        console.error("Error in geteditBrand",Error)
        res.redirect("/pagerror")
    }
};

const editBrand = async (req, res) => {
    try {
        const id = req.params.id;
        const { brandName, brandImage } = req.body;
        
        // If updating to the same name, don't check for existing
        const currentBrand = await Brand.findById(id);
        if (currentBrand.brandName !== brandName) {
            const existingBrand = await Brand.findOne({ 
                brandName: brandName,
                _id: { $ne: id } // Exclude current brand from check
            });
            
            if (existingBrand) {
                return res.status(400).json({
                    error: "Brand name already exists, please choose another"
                });
            }
        }

        const updateData = {
            brandName: brandName
        };

        // Only update image if new one is provided
        if (brandImage) {
            updateData.brandImage = brandImage;
        }

        const updateBrand = await Brand.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (updateBrand) {
            res.redirect("/admin/brands");
        } else {
            res.status(404).json({ error: "Brand not found" });
        }
    } catch (error) {
        console.error("Brand update error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    getBrandPage,
    addBrand,
    blockBrand,
    unBlockBrand,
    getEditBrand,
    editBrand
}