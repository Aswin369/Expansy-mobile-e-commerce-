const Whishlist = require("../../models/whishlistSchema")

const getWhishList = async (req,res)=>{
    try {
        const userId = req.session.user
        console.log("useridasdfa",userId)
        const userWhishlist = await Whishlist.findOne({userId:userId})
        .populate("products.productId")
        console.log("alsdfjklkjasdfjklf",userWhishlist)
        if(!userWhishlist){
            return res.render("wishList",{
                whishList: []
            })
        }
        res.render("wishList", { 
            whishList:userWhishlist.products
        })
    } catch (error) {
        console.error("Error occured in getWhishList",error)
        res.redirect("/pagerror")
    }
}

const addTOWhishlistFromProductDetail = async (req,res)=>{
    try {
        if(!req.session.user){
            return  res.status(401).json({success:false ,message : "Login first"})
          }
          const userId = req.session.user
        console.log("kjf",req.body)
        const {productId} = req.body
        
        let userWhishlist = await Whishlist.findOne({userId:userId})
        
        if(userWhishlist){
            const productExists = userWhishlist.products.some(p => p.productId.equals(productId));
            if (productExists) {
                return res.status(400).json({ success: false, message: "Product already in wishlist" });
            }
            userWhishlist.products.push({ productId })
            await userWhishlist.save()
            return res.status(201).json({success:true, message:"WhishList added"})
        }

        let whishListSave = new Whishlist({
            userId:userId,
            products:[{productId}]
        })
        await whishListSave.save()
        return  res.status(200).json({success:true, message: "whishlist added"})
    } catch (error) {
        console.error("This error occured in addTOWhishlistFromProductDetail",error)
        res.redirect("/pageerror")
    }
}

const deleteWhishlist = async (req,res)=>{
    try {
        const userId = req.session.user
        const whishListProductId = req.params.id
        console.log("asjfhajsghf", whishListProductId)
        const whishListDelete = await Whishlist.findOneAndUpdate({userId:userId},{$pull:{products:{_id:whishListProductId}}},{new:true})
        console.log("afdasfdasfd",whishListDelete)
        if(!whishListDelete){
            return res.redirect("/pageerror")
        }
        return res.redirect("/getWhishlist")
    } catch (error) {
        console.error("This error occured in deleteWhishlist",error)
        res.redirect("/pageerror")
    }
}

module.exports = {
    getWhishList,
    addTOWhishlistFromProductDetail,
    deleteWhishlist
}