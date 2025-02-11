const express = require("express")
const router = express.Router()
const userController = require("../controllers/user/userController")
const passport = require("../config/passport.js")
const {userAuth} = require("../middlewares/auth")
const productController = require("../controllers/user/productDetailController.js")
const shopPageController = require("../controllers/user/shopPageController.js")
const profileController = require("../controllers/user/profileController.js")
const shoppingCartController = require('../controllers/user/shoppingCartController.js')
const wishListController = require("../controllers/user/whishListController.js")

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
router.get("/logout",userController.logout)
router.get("/productDetailPage/:id",productController.productDetail)
router.get("/shopPage",shopPageController.getShopPage)


// user profile management
router.get("/profilePage",profileController.getProfilePage)

// shopping cart management
router.get('/shoppingCart',shoppingCartController.getShoppingCart)

// WhishList management
router.get("/getWhishlist",wishListController.getWhishList)
module.exports = router 