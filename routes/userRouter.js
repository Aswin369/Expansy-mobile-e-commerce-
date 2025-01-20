const express = require("express")
const router = express.Router()
const userController = require("../controllers/user/userController")

router.get("/",userController.loadHomepage)
router.get("/pageNotFound",userController.pageNotFound)
router.get("/login",userController.login)
router.get("/otpverification",userController.verification)
router.get("/signup",userController.loadsignup)
router.post("/signup",userController.signup)
router.get("/*",userController.loadPageNotFound)
module.exports = router 