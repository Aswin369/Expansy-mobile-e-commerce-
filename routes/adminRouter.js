const express = require("express")
const router = express.Router()
const adminController = require("../controllers/admin/adminController")
const customerController = require("../controllers/admin/customerController")
const {adminAuth} = require("../middlewares/auth")
const upload = require("../middlewares/multer")
const categoryController = require("../controllers/admin/categoryController")
const productController = require("../controllers/admin/productController")
const brandController = require("../controllers/admin/BrandController")
const variantController = require("../controllers/admin/variantController")
const orderController = require("../controllers/admin/orderController")

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
router.get("/editCategory/:id", adminAuth, categoryController.getEditCategory)
router.post("/editCategory/:id",upload.single('image'),adminAuth,categoryController.updateCategory)
// Brand Management
router.get("/brands", adminAuth, brandController.getBrandPage);
router.post("/addBrand",upload.single('brandImage'),adminAuth, brandController.addBrand)
router.get("/blockBrand",adminAuth, brandController.blockBrand)
router.get("/unBlockBrand", adminAuth, brandController.unBlockBrand)
router.get("/getEditBrand",adminAuth, brandController.getEditBrand)
router.post("/editBrand/:id",upload.single('brandImage'),adminAuth, brandController.editBrand)
// Product management
router.get("/addProducts",adminAuth, productController.getProductAddPage)
router.post("/addProducts", upload.array("file"),adminAuth,productController.addProducts);
router.get("/products",adminAuth,productController.getAllProducts)
router.get("/blockProduct/:id", adminAuth, productController.blockProduct);
router.get("/UnBlockProduct/:id", adminAuth, productController.UnBlockProduct);
router.get('/editProduct/:id', adminAuth,productController.getEditProduct);
router.put('/editProduct/:productId',upload.single("productImage"),adminAuth,productController.updateImage);
router.get("/viewProducts/:id",adminAuth,productController.viewProduct)
router.put("/updateForm/:productId",adminAuth,productController.updateForm)
router.put("/updateVariantStocks/:productId",adminAuth,productController.updateStocks)
router.delete("/deleteVariantFromEditProduct",adminAuth,productController.deleteVariantEditProduct)
// Variant Management
router.get("/getVariant",adminAuth,variantController.getVariantList)
router.get("/getAddVariant",adminAuth,variantController.getAddVariant)
router.post("/addVariant",adminAuth,variantController.addVariants)
router.get("/blockedRam/:id",adminAuth,variantController.blockRam)
router.get("/UnBlockRam/:id",adminAuth,variantController.UnBlockRam)
router.get("/deleteVariant/:id",adminAuth,variantController.deleteVariant)
router.get("/blockedStorage/:id",adminAuth,variantController.blockedStorage)
router.get("/unBlockStorage/:id",adminAuth, variantController.unBlockStorage)
router.get("/deleteStorage/:id",adminAuth,variantController.deleteStorage)
router.get("/deleteColor/:id",adminAuth,variantController.deleteColor)
router.get("/UnBlockColor/:id",adminAuth,variantController.unBlockColor)
router.get("/blockColor/:id",adminAuth,variantController.blockColor)
// Order Managment
router.get("/getOrderPage",adminAuth,orderController.getOrderPage)
router.get("/orderDetail/:id",adminAuth, orderController.getOrderDetailPage)

module.exports = router