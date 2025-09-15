



const express = require("express");
const { submitVendorDetails,  verifyOtpAndRegisterVendor, getAllVendors, approveVendor, rejectVendor, updateVendorDetails, getVendorById, loginVendor, getAddressByPincode } = require("../controllers/vendorController");


const router = express.Router();

// Register Vendor (expects image URLs in request body)
// router.post("/register", registerVendor);
router.post("/vendor/register", submitVendorDetails); // Step 1: Submit details & get OTP
router.post("/vendor/verify-otp", verifyOtpAndRegisterVendor);

router.post("/admin/login", loginVendor);


// Get All Vendors (Admin Only)
router.get("/admin/vendors", getAllVendors);


// Approve Vendor (Admin Only)
router.post("/admin/approve-vendor/:vendorId", approveVendor);

// Reject Vendor (Admin Only)
router.post("/admin/reject-vendor/:vendorId", rejectVendor);

// Update Vendor Details (Admin Only)
router.put("/admin/update-vendor/:vendorId", updateVendorDetails);

// Get Single Vendor by ID
router.get('/vendors/:id', getVendorById);
router.get("/address", getAddressByPincode);

module.exports = router;






// const express = require("express");
// const { submitVendorDetails, verifyOtpAndRegisterVendor } = require("../controllers/vendorController");


// const router = express.Router();

// router.post("/vendor/register", submitVendorDetails); // Step 1: Submit details & get OTP
// router.post("/vendor/verify-otp", verifyOtpAndRegisterVendor);

// module.exports = router;
