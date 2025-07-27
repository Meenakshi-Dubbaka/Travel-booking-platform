const express=require("express");
const router=express.Router();
const User=require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware");

const usercontroller=require("../contoller/users");


router.route("/signup")
.get(usercontroller.renderSignUpForm)
.post(wrapAsync(usercontroller.signUp));

router.route("/login")
.get(usercontroller.renderLoginForm)
.post(
    savedRedirectUrl,passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),
    usercontroller.login)

router.get("/logout",usercontroller.logout);

module.exports=router;