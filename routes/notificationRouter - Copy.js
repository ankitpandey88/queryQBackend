const express = require("express");
const { sendBookingEmail } = require("../controllers/notificationController");


const notificationRouter = express.Router();

// Define the route for booking confirmation
notificationRouter.post("/booking-email", sendBookingEmail);

module.exports = notificationRouter;
