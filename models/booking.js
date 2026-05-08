const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const bookingSchema=new mongoose.Schema({
    listing:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Listing"
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    amount:Number,
    order_id:String,
    Payment_id:String,
    status:{
        type:String,
        enum:["pending","completed","cancelled"],}
});
const Booking=mongoose.model("Booking",bookingSchema);
module.exports=Booking;