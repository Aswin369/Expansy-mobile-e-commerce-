const passport = require("passport")
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("../models/userSchema")
const env = require("dotenv").config()


passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
    async (accessToken,refreshToken, profile, done)=>{
        try {
            console.log("akudfhalsdkhfsd")
            let user = await User.findOne({googleId:profile.id})
            if(user){
                return done(null, user)
            }else{
                user = new User({
                    name:profile.displayName,
                    email:profile.email[0].value,
                    googleId:profile.id,
                })
                await user.save()
                return done(null, user)
            }
        } catch (error) {
            return done(error, null)
        }
    }
))

// Using assgin user deatials to session
passport.serializeUser((user,done)=>{
    console.log("akudfhalsdkhfsd")
    done(null, user.id)
})

// Using for fetch user data from session
passport.deserializeUser((id,done)=>{
    console.log("akudfhalsdkhfsd")
    User.findById(id)
    .then((user)=>{
        done(null, user)
    })
    .catch((error)=>{
        done(error,null)
    })
})

module.exports = passport
