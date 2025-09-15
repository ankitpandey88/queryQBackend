const express = require( 'express');
const { createOrder, verifyPayment } = require('../controllers/paymentController');


const paymentRoutes = express.Router();

// Create a Razorpay order
paymentRoutes.post('/create-order', createOrder);

// Verify payment
paymentRoutes.post('/verify-payment', verifyPayment);

module.exports = paymentRoutes;