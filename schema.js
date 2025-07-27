const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().allow("", null),
    category: Joi.string()
      .valid(
        "Trending",
        "Rooms",
        "Iconic cities",
        "Castles",
        "Amazing pool",
        "Camping",
        "Farms",
        "Arctic",
        "Dome"
      )
      .required()
  }).required()
});


// ✅ ADD THIS: Joi schema for review validation
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    ratings: Joi.number().min(1).max(5).required(),  // match your form field name
    comment: Joi.string().required()
  }).required()
});
