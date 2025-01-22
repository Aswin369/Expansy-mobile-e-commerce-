const express = require("express")
const User = require("../../models/userSchema");
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")


const loadLogin = async (req,res)=>{
    try {
        if(req.session.admin){
            return res.redirect("/admin/dashboard")
        }
        res.render("admin-login",{message:null})
    } catch (error) {
        console.error("Admin load Login error", error)
        res.status(500).send("server error")
    }
}

module.exports = {
    loadLogin
}