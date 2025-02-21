const User = require("../../models/cartSchema")
const Product = require("../../models/productSchema")
const Cart = require("../../models/cartSchema")
const Address = require("../../models/addressSchema")
const Order = require("../../models/orderSchema")
const mongoose = require("mongoose")

const getShoppingCart = async(req,res)=>{
    try {
        const userId = req.session.user
        if(!userId){
            res.redirect("/login")
        }
        
        const cartUser = await Cart.findOne({userId: new mongoose.Types.ObjectId(userId)})
        .populate("items.productId")
        console.log("hhsdaifjk",cartUser)
        const populatedCartItems = await Promise.all(
            cartUser.items.map(async (item) => {
                const product = item.productId;
                if (!product) return item;
                const specification = product.specification.find(spec => spec._id.equals(item.specId));
                return {
                    ...item.toObject(),
                    specification
                }
            })
        )
        
        res.render("shoppingCart", {
            cartData: { ...cartUser.toObject(), items: populatedCartItems }
        });
    } catch (error) {
        console.error("Error found in shopping cart", error)
    }
}

const productAddToCart = async(req,res)=>{
    try {
        if(!req.session.user){
          return  res.status(401).json({success:false ,message : "Login first"})
        }
        const userId = req.session.user
        const {productId, quantity, price, selectedSpecId} = req.body
        console.log("This is user id",userId)
        console.log("KTHis sdfkasdfhaif",req.body)
        if(quantity<=0){
            return res.status(400).json({success:false, message:"quantity cannot be zero"})
        }
        if(!userId){
             return res.status(400).json({success:false, message:"User not found"})
        }

        if(!productId){
            return res.status(400).json({success:false, message: "Please try again"})
        }
        const productDetail = await Product.findOne({_id:productId})

        const totalPiceOfProduct = price*quantity
        console.log("totalPiceOfProduct",totalPiceOfProduct)
        const cartDart = {
            productId: productId,
            quantity: quantity,
            price: price,
            totalPrice: totalPiceOfProduct,
            specId:selectedSpecId
        }
        const userCart = await Cart.findOne({userId})

      
        if(userCart){
            userCart.items.push(cartDart)
            await userCart.save()
            return res.status(201).json({success:true, message:"Product saved to cart"})
        }else{
            const newCart = new Cart({
                userId: userId,
                items: [cartDart]
            })
            await newCart.save()
           
            return res.status(201).json({success:true, message:"Product saved to cart"})
        }

    } catch (error) {
        console.error("This error occured in productAddToCart", error)
        res.redirect("/pageerror")
    }
}

const deleteProductFromCart = async(req,res)=>{
    try {
        const userId = req.session.user
        const cartId = req.params.productId
        if(!cartId){
            return res.status(400).json({success:true, message:"There is no product please add any product to cart"})
        }
        // console.log("1");
        
        const updateCart = await Cart.updateOne({ userId: userId },{$pull:{items:{_id:cartId}}})

        console.log("thskdfk",updateCart)

        if(!updateCart){
            return res.status(400).json({success:false, message:"Please add a product to cart"})
        }

        res.status(201).json({success:true, message:"Product deleted successfully"})

    } catch (error) {
        
    }
}

const updateCart = async (req,res)=>{
    try {
        
        const {cartId, productId, quantity, price, totalPrice, itemIndex} = req.body
        console.log("sakjdfh",quantity);
        
        if(!cartId){
            return res.status(400).json({success:false, message:"Something went wrong"})
        }
        const updatedCart = await Cart.findOneAndUpdate({ _id: cartId },{ 
                $set: { 
                    [`items.${itemIndex}.productId`]: productId,
                    [`items.${itemIndex}.quantity`]: quantity,
                    [`items.${itemIndex}.price`]: price,
                    [`items.${itemIndex}.totalPrice`]:totalPrice}
                },{ new: true })

        res.status(201).json({success:true})        
    } catch (error) {
        console.error("This error occured in updateCart",error)
        res.redirect("/pageerror")
    }
}

const loadplaceOrder = async (req, res) => {
    try {
        const userId = req.session.user;
        const { cartId } = req.query;
        console.log("this is userid",userId)
        if (!userId) {
            return res.redirect("/login");
        }
        console.log("Cart ID received in loadplaceOrder:", cartId);

        const cartDetails = await Cart.findById(cartId).populate("items.productId")
        const addressDetails = await Address.findOne({userId:userId})
        console.log("THis is cart details",cartDetails)
        console.log("THis is address details",addressDetails)
        res.render("checkoutPage", { 
            cartData: cartDetails,  
            addrressData: addressDetails}); 
    } catch (error) {
        console.error("Error in loadplaceOrder:", error);
        res.redirect("/pageerror");
    }
};



const loadCheckOutPage = async(req,res)=>{
    try {
        const { cartId } = req.query;
        res.status(200).json({ success: true, redirectUrl: `/checkout?cartId=${cartId}`});
    } catch (error) {
        console.error("This error occured in loadCheckOutPage",error)
        res.redirect("/pageerror")
    }
}

const addOrderDetails = async(req,res)=>{
    try {
        const userId = req.session.user
        const {deliveryAddressId, totalAmount, payableAmount, paymentMethod, items} = req.body

        console.log("lkdfa",deliveryAddressId)

        

        console.log("user id ",userId)
        

        const cartDetails = await Cart.findOne({userId:userId})

        const orderProducts = cartDetails.items.map(item => ({
            productId: item.productId,
            specId: item.specId,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice
        }))

        const newOrder = new Order({
            userId,
            products: orderProducts,
            deliveryAddress: deliveryAddressId,
            totalAmount,
            payableAmount,
            paymentMethod
        });

        await newOrder.save();
        console.log("1")
        res.status(200).json({
            success: true,
            message: "Order placed successfully"
        });

    } catch (error) {
        console.error("This error occured in addOrderDetails",error)
        res.redirect("/pageerror")
    }
}

const loadSuccessPage = async(req,res)=>{
    try {
        const userId = req.session.user
        if(!userId){
            res.redirect("/login")
        }
        res.render("orderSuccess")
    } catch (error) {
        
    }
}

module.exports = {
    getShoppingCart,
    productAddToCart,
    deleteProductFromCart,
    updateCart,
    loadCheckOutPage,
    loadplaceOrder,
    addOrderDetails,
    loadSuccessPage
}