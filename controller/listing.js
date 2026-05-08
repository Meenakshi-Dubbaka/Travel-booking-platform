const Listing = require("../models/listing.js");

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

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "The listing you requested for does not exsits");
    return res.redirect("/listings");
  }
  const key = process.env.RAZORPAY_KEY_ID;
  res.render("listings/show.ejs", { listing, razorpayKey: key });
};

module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.image = { url, filename };

  const location = req.body.listing.location;

  try {
    const response = await geocodingClient
      .forwardGeocode({
        query: location,
        limit: 1,
      })
      .send();

    const geoData = response.body.features[0];

    if (geoData) {
      newlisting.geometry = geoData.geometry;
    } else {
      newlisting.geometry = {
        type: "Point",
        coordinates: [0, 0],
      };
    }
  } catch (err) {
    console.error("Mapbox geocoding failed:", err.message);
    newlisting.geometry = {
      type: "Point",
      coordinates: [0, 0],
    };
  }

  await newlisting.save();
  req.flash("success", "New Listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "The listing you requested for does not exsits");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file != "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated !");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted !");
  res.redirect("/listings");
};

module.exports.searchListings = async (req, res) => {
  try {
    const query = req.query.q?.trim() || "";
    // If query is empty redirect back with error
    if (!query) {
      req.flash("error", "Please enter something to search.");
      return res.redirect("/listings");
    }

    const results = await Listing.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
      ],
    });
    if (results.length === 0) {
      req.flash("error", "No listings found.");
      return res.redirect("/listings");
    }

    if (results.length === 1) {
      //  Redirect to single listing page
      return res.redirect(`/listings/${results[0]._id}`);
    }
    return res.render("listings/searchResults", { results, query });
  } catch (err) {
    console.error("Search error:", err);
    req.flash("error", "Something went wrong while searching.");
    return res.redirect("/listings");
  }
};
