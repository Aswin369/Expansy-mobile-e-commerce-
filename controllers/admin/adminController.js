const express = require("express")
const User = require("../../models/userSchema");
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const StatusCode = require("../../constants/statusCode")


const loadLogin = async (req,res)=>{
    try {
        console.log("THis is my req.session.admin",req.session.admin)
        if(req.session.admin){
            return res.redirect("/admin/dashboard")
        }
        res.render("admin-login",{message:null})
    } catch (error) {
        console.error("Admin load Login error", error)
        res.status(StatusCode.INTERNAL_SERVER_ERROR).send("server error")
    }
}

const login = async (req, res) => {
    try {
        const { name, password } = req.body
     
        const admin = await User.findOne({ name, isAdmin: true })
        if (!admin) {
            console.log("Admin not found");
            return res.status(StatusCode.UNAUTHORIZED).json({ message: "Invalid admin credentials" })
        }
        const passwordMatch = await bcrypt.compare(password, admin.password)
        if (passwordMatch) {
            console.log("Login successful");
            req.session.admin = true;
            return res.status(StatusCode.OK).json({ success: true, redirectUrl: "/admin/dashboard" });
        } else {
            console.log("Password not matching")
            return res.status(StatusCode.UNAUTHORIZED).json({ message: "Invalid admin credentials" })
        }
    } catch (error) {
        console.error("Admin login error", error)
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "An error occurred during login" })
    }
}

const loadDashboard = async (req,res)=>{
    console.log(req.session.admin)
    if(req.session.admin){
        
        try {
            res.render("dashboard")
        } catch (error) {
            res.redirect("/pageerror")
        }
    }
}

const logout = async (req, res) => {
    try {
        console.log("Session before destroying:", req.session)

        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err)
                return res.redirect('/pageerror');
            }

            res.clearCookie("connect.sid", { path: "/" })
            console.log("Session successfully destroyed")

            res.status(StatusCode.OK).json({ message: "Logged out successfully" })
        })
    } catch (error) {
        console.error("Unexpected error in logout:", error)
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Logout failed" })
    }
}


module.exports = {
    loadLogin,
    login,
    loadDashboard,
    logout
}