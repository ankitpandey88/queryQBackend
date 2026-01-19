


const express = require("express");

const {
    getLogin,
    createLocation,
    getLocationById,
    createAttendance,
    getAttendanceByEmployeeId,getAddress,
    createEmployee
} = require("../controllers/tataPoweredController");

const tataPoweredRoute = express.Router();

/* ===================== AUTH ===================== */
tataPoweredRoute.post("/login", getLogin);
tataPoweredRoute.post("/signup", createEmployee);

/* ===================== LOCATION ===================== */
tataPoweredRoute.post("/location", createLocation);
tataPoweredRoute.get("/location/:id", getLocationById);

/* ===================== ATTENDANCE ===================== */
tataPoweredRoute.post("/attendance", createAttendance);
tataPoweredRoute.get("/attendance/:employee_id", getAttendanceByEmployeeId);
tataPoweredRoute.get("/getAddress", getAddress);

module.exports = tataPoweredRoute;
