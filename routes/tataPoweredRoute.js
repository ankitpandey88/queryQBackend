
// // const express = require("express");

// // const {  getLogin } = require("../controllers/tataPoweredController");

// // const tataPoweredRoute = express.Router();


// // tataPoweredRoute.post("/login", getLogin);

// // module.exports = tataPoweredRoute;

 
//  const express = require("express");

// const { getLogin,createLocation, getLocationById } = require("../controllers/tataPoweredController");


// const tataPoweredRoute = express.Router();

// // Login API
// tataPoweredRoute.post("/login", getLogin);

// // Location APIs
// tataPoweredRoute.post("/location", createLocation);
// tataPoweredRoute.get("/location/:id", getLocationById);

// module.exports = tataPoweredRoute;



const express = require("express");

const {
    getLogin,
    createLocation,
    getLocationById,
    createAttendance,
    getAttendanceByEmployeeId
} = require("../controllers/tataPoweredController");

const tataPoweredRoute = express.Router();

/* ===================== AUTH ===================== */
tataPoweredRoute.post("/login", getLogin);

/* ===================== LOCATION ===================== */
tataPoweredRoute.post("/location", createLocation);
tataPoweredRoute.get("/location/:id", getLocationById);

/* ===================== ATTENDANCE ===================== */
tataPoweredRoute.post("/attendance", createAttendance);
tataPoweredRoute.get("/attendance/:employee_id", getAttendanceByEmployeeId);

module.exports = tataPoweredRoute;
