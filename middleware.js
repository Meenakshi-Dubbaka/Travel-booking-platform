const Listing=require("./models/listing");
const Review=require("./models/reviews");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");
const {reviewSchema}=require("./schema.js");

module.exports.isLoggedIn = (customMessage = "You must be signed in to access this page.") => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      // Only store the URL if it's a safe GET request
      if (req.method === "GET") {
        req.session.redirectUrl = req.originalUrl;
      }
      req.flash("error", customMessage);
      return res.redirect("/login");
    }
    next();
  };
};


module.exports.savedRedirectUrl=((req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
})
module.exports.isOwner = (message = "You have no permission") => {
  return async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
      req.flash("error", message);
      return res.redirect(`/listings/${id}`);
    }
    next();
  };
};


// listvalidation
module.exports.validatelisting=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errmsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }else{
        next();
    }};

// reviews validation
module.exports. validatereview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errmsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }else{
        next();
    }};  
    
module.exports.isReviewAuthor=(message="you are not author of this review")=>{
  return async(req,res,next)=>{
   let {id,reviewId}=req.params;
  let review=await Review.findById(reviewId);
 if(!review.author.equals(res.locals.currUser._id)){
    req.flash("error",message);
    return res.redirect(`/listings/${id}`);
 }
 next();
}};
