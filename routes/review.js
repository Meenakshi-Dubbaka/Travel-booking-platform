const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const Review=require("../models/reviews.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,validatereview, isReviewAuthor}=require("../middleware.js");

const reviewController=require("../contoller/reviews.js");




// Reviews
//Post route
router.post("/",validatereview,isLoggedIn("You must be signed in to Add review"),wrapAsync(reviewController.createReview))

// Delete review route
router.delete("/:reviewId",isLoggedIn("You must be signed in to delete review"),isReviewAuthor(),wrapAsync(reviewController.deleteReview));

module.exports=router;