const express = require("express")
const router = express.Router()
const adminController = require("../controllers/admin/adminController")
const customerController = require("../controllers/admin/customerController")
const {userAuth,adminAuth} = require("../middlewares/auth")
const categoryController = require("../controllers/admin/categoryController")

// router.get("/pageerror",adminController.pageerror)
router.get("/login",adminController.loadLogin)
router.post("/login",adminController.login)
router.get("/",adminAuth,adminController.loadDashboard)
router.get("/logout", adminController.logout)

// Customer mangement
router.get("/users",adminAuth,customerController.customerInfo)
router.get("/blockCustomer",adminAuth,customerController.customerBlocked)
router.get("/unblockCustomer",adminAuth,customerController.uncustomerBlocked)
router.get("/customerdetails",adminAuth,customerController.customerdetail)
router.get("/admin/customerdetails", adminAuth, customerController.customerdetail);
// Category management
router.get("/category",adminAuth,categoryController.categoryInfo)
router.post("/addCategory", adminAuth, categoryController.addCategory);
router.get("/addCategory", adminAuth,categoryController.loadAddCategory)


module.exports = router