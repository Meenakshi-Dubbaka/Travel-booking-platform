const axios = require("axios");
const Listing=require("../models/listing.js");

module.exports.index = async (req, res) => {
  const { category } = req.query;
  let allListings;

  if (category) {
    allListings = await Listing.find({ category });
  } else {
    allListings = await Listing.find({});
  }

  res.render("listings/index.ejs", { allListings, category });
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};
module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    let listing= await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","The listing you requested for does not exsits");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing,mapToken: process.env.MAP_TOKEN});
};


module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
 

  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.image = { url, filename };

  const location = req.body.listing.location;

  // Geocode with Nominatim
  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: location,
        format: "json",
        limit: 1
      },
      headers: {
        "User-Agent": process.env.NOMINATIM_USER_AGENT
      }
    });

    if (response.data && response.data.length > 0) {
      const geo = response.data[0];
      newlisting.geometry = {
        type: "Point",
        coordinates: [parseFloat(geo.lon), parseFloat(geo.lat)] // [longitude, latitude]
      };
    } else {
      console.warn("No geocoding results for:", location);
      newlisting.geometry = {
        type: "Point",
        coordinates: [0, 0] // fallback
      };
    }
  } catch (err) {
    console.error("Geocoding failed:", err);
    newlisting.geometry = {
      type: "Point",
      coordinates: [0, 0]
    };
  }

  await newlisting.save();
  req.flash("success", "New Listing created!");
  res.redirect("/listings");
};


module.exports.renderEditForm=async (req,res)=>{
      let {id}=req.params;
    let listing= await Listing.findById(id);
    if(!listing){
        req.flash("error","The listing you requested for does not exsits");
        return res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
     originalImageUrl= originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};
module.exports.updateListing=async (req,res)=>{
 let {id}=req.params;
  let listing=await  Listing.findByIdAndUpdate(id,{...req.body.listing}); 
if(typeof req.file!="undefined"){
    let url=req.file.path;
    let filename=req.file.filename ;
    listing.image={url,filename};
    await listing.save();
}
req.flash("success","Listing Updated !");
  res.redirect(`/listings/${id}`);
};
module.exports.deleteListing=async (req,res)=>{
    let {id}=req.params;
   let deletedListing=await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   req.flash("success","Listing Deleted !");
   res.redirect("/listings")
};







