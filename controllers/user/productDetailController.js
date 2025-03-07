const User = require("../../models/userSchema")
const Product = require("../../models/productSchema")
const Brand = require("../../models/brandSchema")
const Category = require("../../models/categorySchema")

const productDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.session.user;
        console.log("Product ID:", id);

        // Fetch all products that are not blocked
        const allProduct = await Product.find({ isBlocked: false });

        // Fetch the product with populated references
        const productData = await Product.findOne({ _id: id, isBlocked: false })
            .populate("brand")
            .populate({
                path: "category",
                populate: { path: "categoryOffer", model: "Offer" }, // Populate category offer
            })
            .populate({
                path: "productOffer",
                model: "Offer", // Populate product offer
            })
            .populate({ path: "specification.ram", model: "Variant" })
            .populate({ path: "specification.storage", model: "Variant" })
            .populate({ path: "specification.color", model: "Variant" });

        if (!productData) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Extract offer details
        const categoryOffer = productData.category?.categoryOffer?.discountValue || 0;
        const categoryOfferId = productData.category?.categoryOffer?._id || null;

        const productOffer = productData.productOffer?.discountValue || 0;
        const productOfferId = productData.productOffer?._id || null;

        // Determine the higher offer
        let appliedOffer, appliedOfferType, appliedOfferId;
        if (productOffer > categoryOffer) {
            appliedOffer = productOffer;
            appliedOfferType = "product";
            appliedOfferId = productOfferId;
        } else {
            appliedOffer = categoryOffer;
            appliedOfferType = "category";
            appliedOfferId = categoryOfferId;
        }

        // Apply the discount to each specification
        productData.specification = productData.specification.map(spec => {
            const discountAmount = (spec.regularPrice * appliedOffer) / 100;
            spec.discountPrice = Math.round(discountAmount); // Store the discount amount separately
            spec.salePrice = Math.round(spec.regularPrice - discountAmount); // Final price after discount
            return spec;
        });

        // Send data to frontend

        console.log("appliedOfferId", appliedOfferId)
        res.render("productdetail", {
            user: user,
            productData,
            allProduct,
            appliedOffer,
            appliedOfferType, // Indicate which offer was applied
            appliedOfferId,   // Pass the applied offer ID
        });

    } catch (error) {
        console.error("Error from product detail page", error);
        res.redirect("/pageerror");
    }
};




module.exports = {
    productDetail,
    
}