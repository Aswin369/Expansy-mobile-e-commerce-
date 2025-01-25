const express = require("express")
const Category = require("../../models/categorySchema")

const categoryInfo = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Current page
        const limit = 4; // Number of items per page
        const skip = (page - 1) * limit; // Items to skip for pagination

        // Fetch categories with pagination
        const categoryData = await Category.find({})
            .sort({ createdAt: -1 }) // Sort by created date in descending order
            .skip(skip) // Skip the required number of items
            .limit(limit) // Limit the number of items
            .select("image name description createdAt updatedAt isListed"); // Select the required fields

        // Count total categories for pagination
        const totalCategories = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategories / limit);

        // Prepare the data to include serial numbers
        const categoriesWithSerialNumbers = categoryData.map((category, index) => ({
            no: skip + index + 1, // Serial number based on pagination
            image: category.image,
            name: category.name,
            description: category.description,
            createdAt: category.createdAt.toLocaleDateString(), // Format date
            updatedAt: category.updatedAt.toLocaleDateString(), // Format date
            status: category.isListed ? "Listed" : "Unlisted" // Convert status to human-readable text
        }));

        // Render the data to the view
        res.render("category-list", {
            cat: categoriesWithSerialNumbers, // Pass processed categories to the view
            currentPage: page,
            totalPages: totalPages,
            totalCategories: totalCategories
        });
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror");
    }
};



const addCategory = async (req, res) => {
    const { name, description } = req.body; // Extract name and description from the request body
    try {
        // Validation: Check if name and description are provided
        if (!name || !description) {
            return res.status(400).json({ error: "Name and description are required" });
        }

        // Check if the category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ error: "Category already exists" });
        }

        // Create a new category if validation passes
        const newCategory = new Category({
            name,
            description,
        });
        await newCategory.save(); // Save the new category to the database

        // Return success response
        return res.json({ message: "Category added successfully" });
    } catch (error) {
        console.error("Error adding category:", error.message); 
        return res.status(500).json({ error: "Internal server error" });
    }
};

const loadAddCategory = async (req,res)=>{
    try {
        res.render("category-add")
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror");
    }
}


module.exports = {
    categoryInfo,
    addCategory,
    loadAddCategory
}
