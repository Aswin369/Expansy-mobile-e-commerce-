const User = require("../../models/userSchema")
const Product = require("../../models/productSchema")
const Brand = require("../../models/brandSchema")
const Category = require("../../models/categorySchema")

const productDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.session.user;
        console.log("Product ID:", id);

        const allProduct = await Product.find({ isBlocked: false });

        const productData = await Product.findOne({ _id: id, isBlocked: false })
            .populate("brand")
            .populate("category")
            .populate({ path: "specification.ram", model: "Variant" })
            .populate({ path: "specification.storage", model: "Variant" })
            .populate({ path: "specification.color", model: "Variant" });

        if (!productData) {
            return res.status(404).json({ error: "Product not found" });
        }

        const categoryOffer = productData.category?.categoryOffer || 0;
        const productOffer = productData.productOffer || 0;

        const appliedOffer = productOffer > categoryOffer ? productOffer : categoryOffer;

        productData.specification = productData.specification.map(spec => {
            const discountAmount = (spec.regularPrice * appliedOffer) / 100;
            spec.salePrice = Math.round(spec.regularPrice - discountAmount);
            return spec;
        });

        res.render("productdetail", {
            user: user,
            productData,
            allProduct,
            appliedOffer 
        });

    } catch (error) {
        console.error("Error from product detail page", error);
        res.redirect("/pageerror");
    }
};


    


module.exports = {
    productDetail,
    
}