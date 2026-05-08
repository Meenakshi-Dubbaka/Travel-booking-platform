const razorpayController = require('../controller/razorpay.js');
const express = require('express');
const { isLoggedIn } = require('../middleware.js');
const router = express.Router();
 
router.post('/create-order',isLoggedIn(), razorpayController.createOrder);
router.post('/verify-payment',isLoggedIn(), razorpayController.verifyPayment);
router.get("/booking-success/:listingId", isLoggedIn(), (req, res) => {
      const { listingId } = req.params;
  req.flash("success", "Payment Successful! Booking confirmed ");
  res.redirect(`/listings/${listingId}`);
});
module.exports = router;