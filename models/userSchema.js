const mongoose = require("mongoose")
const {Schema} = mongoose;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false,
        unique: true,
    },
    phone: {
        type: String,
        required: false,
        unique: false,
        sparse: true,
        default:null,
        unique:false
    },
    googleId:{
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    isBlocked:{
        type: Boolean,
        default: false
    },
    isAdmin:{
        type: Boolean,
        default: false
    },
    cart:[{
        type: Schema.Types.ObjectId,
        ref: "Cart",
    }],
    wallet:{
        type:Number,
        default:0,
    },
    wishlist:[{
        type:Schema.Types.ObjectId,
        ref: "Wishlist"
    }],
    orderHistory:[{
        type:Schema.Types.ObjectId,
        ref:"Oder"
    }],
    referalCode:{
        type:String,
        // required: true
    },
    createdOn:{
        type: Date,
        default: Date.now
    },
    redeemed:{
        type:Boolean,
        // default: false
    },
    redeemedUsers:[{
        type: Schema.Types.ObjectId,
        ref: "User",
        // required: true
    }],
    searchHistory:[{
        category:{
            type: Schema.Types.ObjectId,
            ref:"Category"
        },
        brand:{
            type: String
        },
        searchOn:{
            type:Date,
            default: Date.now
        }
    }]
},{timestamps:true})

const User = mongoose.model("User",userSchema)

module.exports = User
