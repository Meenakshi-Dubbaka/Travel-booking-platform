require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports.createOrder = async (req, res) => {
  try {
    const { listingId } = req.body;
    const listing = await Listing.findById(listingId);
    const amount = listing.price * 100;
    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);

    res.json({ id: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
};
module.exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      listingId,
    } = req.body;
    const listing = await Listing.findById(listingId);
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    if (generatedSignature === razorpay_signature) {
      const booking = new Booking({
        listing: listingId,
        user: req.user._id,
        amount: listing.price,
        order_id: razorpay_order_id,
        Payment_id: razorpay_payment_id,
        status: "completed",
      });
      await booking.save();
      
      res.json({ success: true, booking }); 
      
    } else {
      res.status(400).json({ error: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to verify payment" });
  }
};
