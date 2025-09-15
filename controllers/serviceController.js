



const pool = require("../config/db");



const addVendorServices = async (req, res) => {
    const { vendor_id, email, services } = req.body;

    // Validate input
    if (!vendor_id || !email || !Array.isArray(services) || services.length === 0) {
        return res.status(400).json({ error: "Vendor ID, email, and at least one service are required" });
    }

    try {
        await pool.query("BEGIN"); // Start transaction

        for (const service of services) {
            // Check if the service already exists
            const existingService = await pool.query(
                "SELECT id FROM vendor_services WHERE vendor_id = $1 AND service_name = $2",
                [vendor_id, service.service_name]
            );

            if (existingService.rows.length > 0) {
                return res.status(400).json({ error: `Service '${service.service_name}' already exists for this vendor` });
            }

            // Insert new service if it doesn't exist
            await pool.query(
                "INSERT INTO vendor_services (vendor_id, email, service_name, service_price) VALUES ($1, $2, $3, $4)",
                [vendor_id, email, service.service_name, service.service_price]
            );
        }

        await pool.query("COMMIT"); // Commit transaction
        return res.status(201).json({ message: "Services added successfully" });

    } catch (error) {
        await pool.query("ROLLBACK"); // Rollback on error
        console.error("Error adding services:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


// Get Vendor Services by Email
// const getVendorServicesByEmail = async (req, res) => {
//     const { email } = req.body;

//     if (!email) {
//         return res.status(400).json({ error: "Email is required" });
//     }

//     try {
//         const result = await pool.query(
//             "SELECT service_name, service_price FROM vendor_services WHERE email = $1",
//             [email]
//         );

//         if (result.rows.length === 0) {
//             return res.status(404).json({ message: "No services found for this email" });
//         }

//         return res.status(200).json({
//             vendor_email: email,
//             services: result.rows // Now each service object does not contain 'email'
//         });

//     } catch (error) {
//         console.error("Error fetching services:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };

const getVendorServicesByEmail = async (req, res) => {
    const { id, email } = req.body;

    if (!id && !email) {
        return res.status(400).json({ error: "Either vendor ID or email is required" });
    }

    try {
        let query = "";
        let queryParams = [];

        if (id) {
            query = "SELECT service_name, service_price FROM vendor_services WHERE vendor_id = $1";
            queryParams = [id];
        } else {
            query = "SELECT service_name, service_price FROM vendor_services WHERE email = $1";
            queryParams = [email];
        }

        const result = await pool.query(query, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No services found for the given vendor" });
        }

        return res.status(200).json({
            vendor_identifier: id || email, // Return ID if provided, otherwise email
            services: result.rows
        });

    } catch (error) {
        console.error("Error fetching services:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};





const deleteVendorService = async (req, res) => {
    const { email, service_name } = req.body;

    if (!email || !service_name) {
        return res.status(400).json({ error: "Email and service name are required" });
    }

    try {
        // Normalize input for consistent comparison
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedServiceName = service_name.trim().toLowerCase();

        console.log(`Checking service for deletion: email=${normalizedEmail}, service=${normalizedServiceName}`);

        // Check if the service exists (case-insensitive search)
        const existingService = await pool.query(
            "SELECT * FROM vendor_services WHERE LOWER(TRIM(email)) = $1 AND LOWER(TRIM(service_name)) = $2",
            [normalizedEmail, normalizedServiceName]
        );

        console.log("Existing service:", existingService.rows); // Debugging step

        if (existingService.rows.length === 0) {
            console.log(`Service not found in DB: email=${normalizedEmail}, service=${normalizedServiceName}`);
            return res.status(404).json({ error: "Service not found for this vendor" });
        }

        // Perform the delete operation
        const deleteResult = await pool.query(
            "DELETE FROM vendor_services WHERE LOWER(TRIM(email)) = $1 AND LOWER(TRIM(service_name)) = $2 RETURNING *",
            [normalizedEmail, normalizedServiceName]
        );

        console.log("Deleted service:", deleteResult.rows); // Debugging step

        return res.status(200).json({ message: `Service '${service_name}' deleted successfully` });

    } catch (error) {
        console.error("Error deleting service:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};






module.exports = { addVendorServices, getVendorServicesByEmail , deleteVendorService};

