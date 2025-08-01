const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./reviews.js");
const { string } = require("joi");
const listingSchema=new Schema({
       title:{
        type:String,
        required:true,
    },
       description:String,
       image:{
        url:String,
        filename:String,
    },
       price:Number,
       location:String,
       country:String,
       reviews:[{
         type:Schema.Types.ObjectId,
         ref:"Review",
       },],
       owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
       },
       geometry: {
  type: {
    type: String,
    enum: ["Point"],
    required: true,
    default: "Point"
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  },  
},
category:{
    type:String,
    enum:["Trending","Rooms","Iconic cities","Castles","Amazing pool","Camping","Farms","Arctic","Dome"],
    required:true
  },
       
})
listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id:{$in: listing.reviews}});
  }
  
})
const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;