const express = require("express")
const Product = require("../../models/productSchema")
const Category = require("../../models/categorySchema")
const Brand = require("../../models/brandSchema")
const fs = require("fs")
const path = require("path")
const User = require("../../models/userSchema")
const sharp = require("sharp")

const getProductAddPage = async (req,res)=>{
    try {
        res.render("product-add")
        
    } catch (error) {
        res.redirect("/pageerror")
    }
}

module.exports = {
    getProductAddPage
}