const express = require("express")
const router = express.Router()
const userController = require("../controllers/user/userController")
const passport = require("../config/passport.js")

router.get("/",userController.loadHomepage)
router.get("/signup",userController.loadsignup)
router.post("/signup",userController.signup)
router.get("/login",userController.loadlogin)
router.post("/login",userController.login)

router.get("/otpverification",userController.verification)
router.post("/otpverification",userController.verifyOtp)
router.post("/resendOtp",userController.resendOtp)

router.get("/auth/google",passport.authenticate('google',{scope:["profile","email"]}))
router.get("/auth/google/callback",passport.authenticate("google",{failureRedirect:"/signup"}), (req, res)=>{
    res.redirect("/")
})

// router.use("*",userController.loadPageNotFound)

module.exports = router 