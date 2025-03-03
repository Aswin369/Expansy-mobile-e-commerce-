const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid")

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    orderId: {
        type: String,
        unique: true,
        default: () => `EXPSYORDID-${uuidv4().split("-")[0].toUpperCase()}`, 
      },
    products: [{
        productId:{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product', 
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
            type: Number,
            required: true
        },
        offerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Offer",
            default: null
      },
    }],
    status: { 
        type: String, 
        default: 'Pending', 
        enum: ['Return Requested', 'Return Approved', 'Return Rejected','Ordered', 'Pending', 'Delivered', 'Cancelled'] 
    },
    deliveryAddress: { 
        type: Object, 
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
        enum: ['cod','Wallet', 'razorpay'], 
        required: true 
    },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid', 'failed'], 
        default: 'pending' 
    },
    razorpayPaymentStatus: { 
        type: String, 
        enum: ['pending', 'paid', 'failed'], 
        default: 'pending' 
    },
    razorpayOrderId: { 
        type: String 
    },
    razorpayPaymentId: { 
        type: String 
    },
    razorpaySignature: { 
        type: String 
    },
    returnReason: {
        type: String,
        default: null
    }
}, { timestamps: true });


const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
