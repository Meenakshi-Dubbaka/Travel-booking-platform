if(process.env.NODE_ENV!="production"){
   require('dotenv').config();
}


const express=require("express");
const app=express();
const port = process.env.PORT || 3000;
const path=require("path");
const mongoose=require("mongoose");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");



const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");


const dburl=process.env.ATLASDB_URL;
async function main() {
    await mongoose.connect(dburl);
};
main().then(()=>{
console.log("connected to DB")
}).catch((err)=>{
    console.log(err);
});

app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")));

const store=MongoStore.create({
    mongoUrl:dburl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});
store.on("error",(err)=>{
    console.log("error in mongo session store",err);
})
const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() +7 *24* 60* 60* 1000,
        maxAge:7 *24* 60* 60* 1000,
        httpOnly:true,
 }};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());//step-1 to user passport
app.use(passport.session());// step-2 to identify same logged in from page to page
passport.use(new LocalStrategy(User.authenticate()));// step-3 to use local strategy user to use authenticate method
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{ 
    res.locals.currUser=req.user;
    res.locals.successmsg=req.flash("success");
    res.locals.errormsg=req.flash("error");
    next();
})



app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.get("/",(req,res)=>{
    res.redirect("/listings");
});



// Unmatched routes
app.all('/:unmatchedRoute', (req, res,next) => {
   next(new ExpressError(404,"page not found!"));
});
// Error Handling
app.use((err, req, res, next) => {
    const { statusCode=500 , message = "Something went wrong" } = err;
     res.status(statusCode).render("error.ejs",{message})

});

app.listen(port,()=>{
    console.log(`server is listening to port:${port}`);
})





