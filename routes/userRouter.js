const express = require("express")
const router = express.Router()
const userController = require("../controllers/user/userController")
const passport = require("passport")

router.get("/",userController.loadHomepage)
router.get("/pageNotFound",userController.pageNotFound)
router.get("/login",userController.login)
router.get("/signup",userController.loadsignup)
router.post("/signup",userController.signup)
router.get("/otpverification",userController.verification)
router.post("/otpverification",userController.verifyOtp)
router.get("/*",userController.loadPageNotFound)
router.post("/resendOtp",userController.resendOtp)

router.get("/auth/google", (req, res) => {
    console.log("Google OAuth route hit");
    res.send("Google OAuth route is working");
});


// Google OAuth callback route
router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/signup" }),
    (req, res) => {
        res.redirect("/"); // Redirect to homepage after successful login
    }
);

module.exports = router 