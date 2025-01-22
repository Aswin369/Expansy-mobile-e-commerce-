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

const login = async (req,res)=>{
    try {
        const {name, password} = req.body
        console.log(name,password)
        console.log("this is from admin login", name, password)
        const admin = await User.findOne({name, isAdmin:true})
        if(admin){
            const passwordMatch = await bcrypt.compare(password,admin.password)
            if(passwordMatch){
                req.session.admin = true
                return res.redirect("/admin")
            }else{
                return res.redirect("/login")
            }
        }else{
            return res.render("admin-login", { message: "Admin not found" })
        }
    } catch (error) {
        console.error("Admin login error",error)
        return res.redirect("/pageerror")
    }
}

const loadDashboard = async (req,res)=>{
    if(req.session.admin){
        try {
            res.render("dashboard")
        } catch (error) {
            res.redirect("/pageerror")
        }
    }
}

module.exports = {
    loadLogin,
    login,
    loadDashboard
}