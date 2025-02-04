const mongoose = require("mongoose")
const {Schema} = mongoose

const variantSchema = new moongoose.Schema({
    category:{
        type:String,
        required:true,
        enum:["ram", "storage"]
    },
    value:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:tre
    },
    isBlocked:{
        type:Boolean,
        default:false
    }
},{Timestamp:true})
