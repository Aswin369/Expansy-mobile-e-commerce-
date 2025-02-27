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
const palceOderController = require("../controllers/user/placeOderController.js")

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
router.get("/sorting", shopPageController.getProducts)
router.get("/priceSorting", shopPageController.getFilteredProducts);
router.get("/filterByCategory", shopPageController.getFilteredProductsByCategory)
router.get("/search", shopPageController.searchProducts)
// router.get('/search-products', shopPageController.searchProducts);
// router.get('/filter-products', shopPageController.filterProducts);
// router.get('/filter-products', shopPageController.filterAndSortProducts);

// userForgot password
router.get("/forgot-password",profileController.getForgotPassPage)
router.get("/forgot-email-valid",profileController.getVerifyOtpPage)
router.post("/forgot-email-valid",profileController.forgotEmailValid)
router.post("/verify-pass-forgot-otp",profileController.verifyForgotPassOtp)
router.post("/verify-pass-resend-otp",profileController.verifyPasswordResendOTP)
router.get("/change-password",profileController.getchangePasswordPage)
router.post("/change-password",profileController.changePassword)
// user profile management
router.get("/profilePage",userAuth,profileController.getProfilePage)
router.post("/editProfile",userAuth,profileController.editUserProfile)
router.post("/addaddress",userAuth,profileController.addUserAddress)
router.delete("/deleteAddress/:addressId",userAuth,profileController.deleteAddress)
router.get("/getAddress/:addressId",userAuth,profileController.getUserAddressId)
router.post("/updateAddress/:addressId",userAuth,profileController.updateAddress)
router.get("/ordersview/:orderId",userAuth,profileController.loadOrderDetailPage)
router.get("/deleteOrder",userAuth,profileController.deleteOrder)
// shopping cart management
router.get('/shoppingCart',userAuth,shoppingCartController.getShoppingCart)
router.post("/addToCart",shoppingCartController.productAddToCart)
router.delete("/deleteCartProduct/:productId",shoppingCartController.deleteProductFromCart)
router.post('/update-cart-item',userAuth,shoppingCartController.updateCart)
router.get("/process-checkout",userAuth, shoppingCartController.loadCheckOutPage)
router.get("/checkout",userAuth, shoppingCartController.loadplaceOrder)
router.post("/placeOrder",userAuth, shoppingCartController.addOrderDetails)
router.get("/ordersuccess",userAuth, shoppingCartController.loadSuccessPage)
// WhishList management
router.get("/getWhishlist",userAuth,wishListController.getWhishList)
// Place order
router.get("/palceOder",userAuth,palceOderController.getPlaceOrderPage)
module.exports = router 