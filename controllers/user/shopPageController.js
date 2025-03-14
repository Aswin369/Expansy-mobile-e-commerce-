const express = require("express")
const Product = require("../../models/productSchema")
const Brand = require("../../models/brandSchema")
const Category = require("../../models/categorySchema")

// Controller - getShopPage function
const getShopPage = async (req, res) => {
    try {
        // Initialize query object
        const queryObj = { isBlocked: false };
        
        // Get page from query params, default to 1
        const page = parseInt(req.query.page) || 1;
        const limit = 8; // Products per page
        const skip = (page - 1) * limit;
        
        // --- FILTER HANDLING ---
        
        // 1. Brand filter
        if (req.query.brand && req.query.brand !== 'All') {
            // Find brand ID by brandName (not name as in your original code)
            const brand = await Brand.findOne({ brandName: req.query.brand });
            if (brand) {
                queryObj.brand = brand._id;
                console.log("Found brand:", brand);
            } else {
                console.log("Brand not found:", req.query.brand);
            }
        }
        
        // 2. Price range filter
        if (req.query.price) {
            // Parse price range string like "₹10,000.00 - ₹35,000.00"
            const priceRange = req.query.price;
            let minPrice, maxPrice;
            
            // Handle special case for "₹100,000.00+"
            if (priceRange.includes('+')) {
                minPrice = parseFloat(priceRange.replace(/[₹,\+\s]/g, ''));
                maxPrice = Number.MAX_SAFE_INTEGER;
            } else {
                // Split by dash and convert to numbers
                const [min, max] = priceRange.split('-').map(p => 
                    parseFloat(p.replace(/[₹,\s]/g, ''))
                );
                minPrice = min;
                maxPrice = max;
            }
            
            // Add price range to query for specification.salePrice
            queryObj['specification.salePrice'] = { 
                $gte: minPrice, 
                $lte: maxPrice 
            };
        }
        
        // 3. Category filter
        if (req.query.category && req.query.category !== 'All') {
            // Find category ID by name
            const category = await Category.findOne({ 
                name: { $regex: new RegExp(req.query.category, 'i') } 
            });
            if (category) {
                queryObj.category = category._id;
            }
        }
        
        // 4. Search query implementation
        if (req.query.search) {
            queryObj.productName = { 
                $regex: new RegExp(req.query.search, 'i') 
            };
        }
        
        // --- SORTING HANDLING ---
        let sortOption = {};
        
        if (req.query.sort) {
            switch(req.query.sort) {
                case 'a-z':
                    sortOption = { productName: 1 }; // Ascending
                    break;
                case 'z-a':
                    sortOption = { productName: -1 }; // Descending
                    break;
                case 'new':
                    sortOption = { createdAt: -1 }; // Latest first
                    break;
                default:
                    sortOption = { createdAt: -1 }; // Default to newest
            }
        } else {
            // Default sorting
            sortOption = { createdAt: -1 };
        }
        
        // --- EXECUTE QUERY ---
        
        // Count total filtered products for pagination
        const totalProducts = await Product.countDocuments(queryObj);
        const totalPages = Math.ceil(totalProducts / limit);
        
        // Get products with populated references
        const products = await Product.find(queryObj)
            .populate('brand')
            .populate('category')
            .populate('specification.ram')
            .populate('specification.storage')
            .populate('specification.color')
            .sort(sortOption)
            .skip(skip)
            .limit(limit);
        
        // Get all brands for filter buttons
        const allBrands = await Brand.find({ isBlocked: false });
        
        // Render the shop page
        res.render('shop-page', {
            product: products,
            brands: allBrands, // Pass all brands to the template
            currentPage: page,
            totalPages,
            totalProducts,
            // Pass current filters to highlight active options
            activeFilters: {
                brand: req.query.brand || 'All',
                price: req.query.price || '',
                category: req.query.category || '',
                sort: req.query.sort || '',
                search: req.query.search || ''
            }
        });
        
    } catch (error) {
        console.error('Shop page error:', error);
        res.status(500).render('error', { 
            message: 'Something went wrong fetching products' 
        });
    }
}

module.exports = {
    getShopPage
}
