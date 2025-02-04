const mongoose = require("mongoose")
const {Schema} = mongoose

const variantSchema = new mongoose.Schema({
    category:{
        type:String,
        required:true,
        enum:["Ram", "Storage"]
    },
    value:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    }
},{timestamp:true})

const Variant = mongoose.model("Variant", variantSchema);

module.exports =  Variant
