const mongoose = require("mongoose")
const {Schema} = mongoose

const whishlistSchema = new mongoose.Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    products:[{
        productsId:{
            type:Schema.Types.ObjectId,
            ref: "Product",
            required:true
        },
        addedOn:{
            type: Date,
            default: Date.now
        }
    }]
})

const Whishlist = mongoose.Schema("Whishlist",whishlistSchema)

module.exports = Whishlist