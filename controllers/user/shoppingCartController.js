const User = require("../../models/cartSchema")
const Product = require("../../models/productSchema")
const Cart = require("../../models/cartSchema")
const Address = require("../../models/addressSchema")
const Order = require("../../models/orderSchema")
const mongoose = require("mongoose")
const razorpay = require("../../config/razorpay")
const crypto = require("crypto")
const Coupon = require("../../models/couponSchema")

const getShoppingCart = async(req,res)=>{
    try {
        const userId = req.session.user
        console.log("This is userid", userId)
        if(!userId){
            res.redirect("/login")
        }
        
        const cartUser = await Cart.findOne({userId: new mongoose.Types.ObjectId(userId)})
        .populate("items.productId")
        console.log("hhsdaifjk",cartUser)
        if (!cartUser || cartUser.items.length === 0) {
            return res.render("shoppingCart",{cartData:{items:[]}, user:userId});
        }
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
            cartData: { ...cartUser.toObject(), items: populatedCartItems },user: userId
        })
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
        
        const cartDetail = await Cart.find({userId:userId},{"items.productId":productId},{"items.$":1})
        

        console.log("This is cartDetail",cartDetail)

        if(quantity<=0){
            return res.status(400).json({success:false, message:"quantity cannot be zero"})
        }
        if(!userId){
             return res.status(400).json({success:false, message:"User not found"})
        }

        if(!productId){
            return res.status(400).json({success:false, message: "Please try again"})
        }
        const productDetail = await Product.findOne({ _id: productId });
        if (!productDetail) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const spec = productDetail.specification.find(s => s._id.toString() === selectedSpecId);
        if (!spec) {
            return res.status(404).json({ success: false, message: "Specification not found" });
        }

        const availableStock = spec.quantity;
       
        let userCart = await Cart.findOne({ userId });

        let existingCartItem = null;
        if (userCart) {
            existingCartItem = userCart.items.find(item => item.specId.toString() === selectedSpecId);
        }

       
        const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0;
        const totalQuantity = currentCartQuantity + quantity;

       
        if (totalQuantity > availableStock) {
            return res.status(400).json({ success: false, message: "Not enough stock available!" });
        }

        const totalPiceOfProduct = price*quantity
        console.log("totalPiceOfProduct",totalPiceOfProduct)
        const cartDart = {
            productId: productId,
            quantity: quantity,
            price: price,
            totalPrice: totalPiceOfProduct,
            specId:selectedSpecId
        }
        
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

// checkout page controller

const loadplaceOrder = async (req, res) => {
    try {
        const userId = req.session.user;
        const { cartId } = req.query;
        console.log("this is userid",userId)
        if (!userId) {
            return res.redirect("/login");
        }
        
        const cartDetails = await Cart.findById(cartId).populate("items.productId")
        
        let cartTotal = 0
        
        cartDetails.items.forEach((val)=>{
            cartTotal+=val.quantity * val.price
        })
        
        console.log("cartTotal", cartTotal)
        
        const validCoupons = await Coupon.find({isActive: true});
        


        const addressDetails = await Address.findOne({userId:userId})
        console.log("THis is cart details",cartDetails)
        console.log("THis is address details",addressDetails)
        res.render("checkoutPage", { 
            cartData: cartDetails,  
            addrressData: addressDetails,
            validCouponData: validCoupons
        })

        console.log("coupoins", validCoupons)
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
        const {deliveryAddressId, totalAmount, payableAmount, paymentMethod} = req.body

        console.log("this is req.bosdy",req.body)

        const addressData = await Address.findOne({userId: new mongoose.Types.ObjectId(userId),"address._id": new mongoose.Types.ObjectId(deliveryAddressId)},{"address.$":1})
        
        const deliveryAddress = { ...addressData.address[0]}
        console.log("lkdfa",addressData)
        console.log("user id ",userId)
        console.log("user address id ",deliveryAddressId)
        

        const cartDetails = await Cart.findOne({userId:userId})

        const cartId = cartDetails._id

        console.log("Thisis sdkjfa acart id ", cartId)

        const orderProducts = cartDetails.items.map(item => ({
            productId: item.productId,
            specId: item.specId,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice
        }))

        console.log("T",orderProducts)
        const newOrder = new Order({
            userId,
            products: orderProducts,
            deliveryAddress: deliveryAddress,
            totalAmount,
            payableAmount,
            paymentMethod : paymentMethod == 'ONLINE' ? 'razorpay': paymentMethod
        });

        await newOrder.save();
        await Cart.deleteOne({_id:cartId})

        console.log("1",newOrder._id)
        res.status(200).json({
            success: true,
            message: "Order placed successfully",
            orderId:newOrder._id
        });

        for (const item of orderProducts) {
            const { productId, specId, quantity } = item;
            const product = await Product.findOneAndUpdate(
              {
                _id: productId,
                'specification._id': specId
              },
              {
                $inc: { 'specification.$.quantity': -quantity } 
              },
              {
                new: true, 
                runValidators: true 
              }
            );
      
            if (!product) {
              throw new Error(`Product with ID ${productId} or specification ${specId} not found`);
            }

            // console.log(`Stock updated for product ${productId}, spec ${specId}. New quantity: ${updatedSpec.quantity}`);
          }

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
        console.error("This error occured in loadSuccess page", error)
        res.redirect("/pageerror")
    }
}

const razorpayOrder = async (req,res)=>{
    try {
        const options = {
            amount: req.body.amount,
            currency: 'INR',
            receipt: 'receipt_' + Math.random().toString(36).substring(7),
        };

        const order = await razorpay.orders.create(options);
        console.log(order)
        res.status(200).json(order);
    } catch (err) {
        console.log("This error occured in razorpayOrder",err)
        res.redirect("/pageerror")
     }

}

const verifiyPayment = async (req,res) =>{
    try {
        const { razorpayOrderId ,razorpayPaymentId,razorpaySignature,orderId} = req.body;
        console.log(razorpayOrderId ,razorpayPaymentId,razorpaySignature,orderId)
        const sign = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSign = crypto.createHmac('sha256', "7FaXYkyBxYgWdzIHBWr7ntSa")
            .update(sign.toString())
            .digest('hex');

        if (razorpaySignature === expectedSign) {
            const orderData = await Order.findById(orderId)
            orderData.paymentStatus = "success"
            await orderData.save()
            res.status(200).json({ message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ error: 'Invalid payment signature' });
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message });
    } 

} 

const applyCoupon = async (req,res)=>{
    try {
        console.log("coupon data", req.body)
        const {couponCode, cartId} = req.body
        if(!cartId){
            return res.status(400).json({success:true, message:"CartId is not defined, Please try again"})
        }

        let totalCartPrice = 0
        const cartData = await Cart.findOne({_id:cartId})
        cartData.items.forEach((val)=>{
           totalCartPrice += val.price * val.quantity
        })
        console.log("first time totalCartPrice", totalCartPrice)

        const couponData = await Coupon.findOne({code:couponCode,isActive:true})

        if(!couponData){
            return res.status(400).json({success:false, message: "Invalid please try another coupon"})
        }

        // const currentDate = new Date()

        // if(currentDate < new Date(couponData.startDate) || currentDate > new Date(couponData.expirationDate)){
        //     return res.status(400).json({success:false, message: "coupon is not valid at this time"})
        // }

        if(totalCartPrice < couponCode.minDiscountValue){
            return res.status(400).json({success:false, message: `Coupon is only valid for above ${couponData.minDiscountValue}`})
        }

        let discountValue = couponData.discountValue

        console.log("discountValue", discountValue)

        let disCountAmount = (totalCartPrice * parseInt(couponData.discountValue)) / 100

        console.log("forst disCountAmount", disCountAmount)

        if(totalCartPrice > couponData.maxDiscountValue){
            disCountAmount = totalCartPrice / couponData.discountValue
        }

        const finalPrice = totalCartPrice - disCountAmount

        console.log("totalCartPrice",totalCartPrice)
        console.log("disCountAmount",disCountAmount)
        console.log("finalPrice",finalPrice)

        return res.status(200).json({success:true, message: "Coupon applied successfully", totalCartPrice, disCountAmount, finalPrice})

    } catch (error) {
        console.error("THis error occured in applycoupon", error)
        res.redirect("/pageerror")
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
    loadSuccessPage,
    razorpayOrder,
    verifiyPayment,
    applyCoupon
}