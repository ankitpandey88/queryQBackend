const express = require("express");
const { addVendorServices, getVendorServicesByEmail, deleteVendorService } = require("../controllers/serviceController");

const serviceRoute = express.Router();
serviceRoute.post("/addVendorServices", addVendorServices);
serviceRoute.post("/getVendorServicesByEmail", getVendorServicesByEmail);
serviceRoute.post("/deleteVendorServices", deleteVendorService);


module.exports =  serviceRoute;
