const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner,validatelisting}=require("../middleware.js");
const listingController=require("../contoller/listing.js");
const multer=require("multer");
const {storage}= require("../cloudConfig.js")
const upload = multer({ storage })

// Index Route
router
.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn("You must be signed in to create a listing."),
upload.single('listing[image]'),
validatelisting,
wrapAsync(listingController.createListing));




// New Route
router.get("/new",
    isLoggedIn("You must be signed in to create a listing."),
    listingController.renderNewForm)


router.use((req, res, next) => {
  console.log("Matched URL:", req.originalUrl);
  next();
});


      
// New Route
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn("You must be signed in to edit this listing."),
upload.single('listing[image]'),
validatelisting,isOwner("you are not owner of this listing to edit"),
 wrapAsync(listingController.updateListing))
.delete(isLoggedIn("You must be signed in to delete this listing."),isOwner("you are not owner of this listing to delete"),wrapAsync(listingController.deleteListing));


// Edit Route
router.get("/:id/edit",
    isLoggedIn("You must be signed in to edit this listing."),
    isOwner("you are not owner of this listing"),
    wrapAsync(listingController.renderEditForm));


   

module.exports=router;