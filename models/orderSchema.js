const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'User', 
        required: true 
    },
    products: [
      {
        productId:{ 
            type: mongoose.Schema.Types.ObjectId, ref: 'Product', 
            required: true 
        },
        specId:{
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        quantity:{
             type: Number, 
             required: true 
            },
        price: { 
            type: Number, 
            required: true 
        },
        totalPrice:{
            type:Number,
            required:true
        }
      },
    ],
    status: { 
        type: String, default: 'Pending', 
        enum:['Return Requested','Return Approved','Return Rejected','Pending','Delivered','Cancelled'] 
    },
    deliveryAddress: { 
        addressId: String, 
        required: true 
    },
    totalAmount: { 
        type: Number, 
        required: true 
    },
    payableAmount: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    paymentMethod: { 
        type: String, 
        enum: ['cod', 'razorpay'], 
        required: true 
    },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid', 'failed'], default: 'pending' 
    },
    returnReason:{
        type: String,
        default:null
    }
  },{timestamps:true});
  

const Order = new mongoose.model("Order",orderSchema)
module.exports = Order;