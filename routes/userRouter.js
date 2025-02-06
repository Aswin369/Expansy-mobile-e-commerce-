const express = require("express")
const router = express.Router()
const userController = require("../controllers/user/userController")
const passport = require("../config/passport.js")
const {userAuth} = require("../middlewares/auth")
const productController = require("../controllers/user/productDetailController.js")
const shopPageController = require("../controllers/user/shopPageController.js")


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

router.get("/productDetailPage/:id",userAuth,productController.productDetail)
router.get("/shopPage",userAuth,shopPageController.getShopPage)


module.exports = router 