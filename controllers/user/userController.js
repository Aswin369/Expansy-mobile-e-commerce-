const loadHomepage = async (req,res)=>{
    try{
        return res.render("home")
    }catch(error){
        console.log("Home page not found")
        res.status(500).send("Server error")
    }
}

const pageNotFound = async (req,res) =>{
    try{
        return res.render("404")
    }catch(error){
        res.redirect("/pageNotFound")
    }
}

const login = async (req,res)=>{
    try{
        return res.render("login")
    }catch(error){
        console.log("Login page not found")
    }
}

const verification = async (req,res)=>{
    try{
        return res.render("otpverification")
    }catch(error){
        console.log("Verification page not found")
    }
}

const signup = async (req,res)=>{
    try {
        return res.render("signup")
    } catch (error) {
        console.log("Signup page not found")
    }
}

module.exports = {
    loadHomepage,
    pageNotFound,
    login,
    verification,
    signup
}