
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const pool = require("./config/db"); // PostgreSQL connection

const router = require("./routes/vendorRoutes");
const uresRouter = require("./routes/userRoutes");
const serviceRouter = require("./routes/serviceRoutes");

const notificationRouter = require("./routes/notificationRouter");
const bookingRouter = require("./routes/bookingRouter");

// Initialize Express app
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// API Routes
// app.use("/api/vendors", router);
app.use("/api", router);
app.use("/api/users", uresRouter);

//Api for Add vendor services

app.use("/api",serviceRouter);




// notification router

app.use('/api', notificationRouter);

// booking router

app.use('/api', bookingRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


