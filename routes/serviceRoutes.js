// const express = require("express");
// const { addVendorServices, getVendorServicesByEmail, deleteVendorService, addVendorServicesNew, getVendorServicesGrouped, deleteVendorServiceNew } = require("../controllers/serviceController");

// const serviceRoute = express.Router();
// serviceRoute.post("/addVendorServices", addVendorServices);
// serviceRoute.post("/getVendorServicesByEmail", getVendorServicesByEmail);
// serviceRoute.post("/deleteVendorServices", deleteVendorService);


// serviceRoute.post("/addServicesCategry", addVendorServicesNew);
// serviceRoute.post("/get", getVendorServicesGrouped);
// serviceRoute.post("/ deleteVendorServiceNew", deleteVendorServiceNew);


// module.exports =  serviceRoute;


const express = require("express");
const {
  addVendorServices,
  getVendorServicesByEmail,
  deleteVendorService,
  addVendorServicesNew,
  getVendorServicesGrouped,
  deleteVendorServiceNew
} = require("../controllers/serviceController");

const serviceRoute = express.Router();

serviceRoute.post("/addVendorServices", addVendorServices);
serviceRoute.post("/getVendorServicesByEmail", getVendorServicesByEmail);
serviceRoute.post("/deleteVendorServices", deleteVendorService);

serviceRoute.post("/addServicesCategry", addVendorServicesNew);

// changed here -> GET
serviceRoute.get("/getServiceCategrys", getVendorServicesGrouped);
// you had a space in the path - removed it and use POST or DELETE properly
serviceRoute.post("/deleteVendorServiceNew", deleteVendorServiceNew);

module.exports = serviceRoute;

 
 