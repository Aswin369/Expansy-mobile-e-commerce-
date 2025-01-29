const express = require("express")
const router = express.Router()
const adminController = require("../controllers/admin/adminController")
const customerController = require("../controllers/admin/customerController")
const {userAuth,adminAuth} = require("../middlewares/auth")
const upload = require("../middlewares/multer")
const categoryController = require("../controllers/admin/categoryController")
const productController = require("../controllers/admin/productController")
const brandController = require("../controllers/admin/BrandController")

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
router.post("/addCategory", upload.single('file'),adminAuth, categoryController.addCategory);
router.get("/addCategory", adminAuth,categoryController.loadAddCategory)
router.get('/listCategory', adminAuth,categoryController.getListCategory);
router.get('/unlistCategory', adminAuth, categoryController.getUnlistCategory);
router.get("/editCategory",adminAuth, categoryController.getEditCategory)
router.post("/editCategory/:id", adminAuth, categoryController.editCategory)
// Brand Management
router.get("/brands", adminAuth, brandController.getBrandPage);
router.post("/addBrand",upload.single('brandImage'),adminAuth, brandController.addBrand)
router.get("/blockBrand",adminAuth, brandController.blockBrand)
router.get("/unBlockBrand", adminAuth, brandController.unBlockBrand)
router.get("/getEditBrand",adminAuth, brandController.getEditBrand)
router.post("/editBrand/:id",upload.single('brandImage'),adminAuth, brandController.editBrand)
// Product management
router.get("/addProducts",adminAuth, productController.getProductAddPage)


module.exports = router