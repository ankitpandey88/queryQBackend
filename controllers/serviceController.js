



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




// Add or update many services for a vendor
// Body: { vendor_id: 123, services: [{ category, subcategory, price, meta? }, ...] }
const addVendorServicesNew = async (req, res) => {
  const { vendor_id, services } = req.body;
  if (!vendor_id || !Array.isArray(services) || services.length === 0) {
    return res.status(400).json({ error: "vendor_id and non-empty services array are required" });
  }

  try {
    await pool.query("BEGIN");

    for (const s of services) {
      const category = (s.category || "").trim();
      const subcategory = (s.subcategory || "").trim();
      const price = s.price;
      const meta = s.meta ? s.meta : null;

      if (!category || !subcategory || price == null || Number.isNaN(Number(price))) {
        await pool.query("ROLLBACK");
        return res.status(400).json({ error: "Each service needs category, subcategory and numeric price" });
      }

      // Upsert row based on unique constraint (vendor_id + category + subcategory)
      await pool.query(
        `INSERT INTO vendor_services_flat (vendor_id, category, subcategory, price, meta)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (vendor_id, lower(category), lower(subcategory))
         DO UPDATE SET price = EXCLUDED.price, meta = EXCLUDED.meta, updated_at = now();`,
        [vendor_id, category, subcategory, Number(price), meta]
      );
    }

    await pool.query("COMMIT");
    return res.status(201).json({ message: "Services saved/updated successfully" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("addVendorServices error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get vendor services grouped by category
// GET /api/vendor-flat/services?vendor_id=123  OR /api/vendor-flat/services/123
const getVendorServicesGrouped = async (req, res) => {
  const vendorId = req.query.vendor_id || req.params.vendor_id;
  if (!vendorId) return res.status(400).json({ error: "vendor_id is required (query or path param)" });

  try {
    const { rows } = await pool.query(
      `SELECT id, category, subcategory, price, meta
       FROM vendor_services_flat
       WHERE vendor_id = $1
       ORDER BY category, subcategory;`,
      [vendorId]
    );

    // group by category
    const grouped = rows.reduce((acc, r) => {
      const cat = r.category;
      acc[cat] = acc[cat] || [];
      acc[cat].push({
        id: r.id,
        subcategory: r.subcategory,
        price: Number(r.price),
        meta: r.meta
      });
      return acc;
    }, {});

    // Convert to array format if you prefer:
    const result = Object.keys(grouped).map(cat => ({ category: cat, subcategories: grouped[cat] }));

    return res.status(200).json({ vendor_id: Number(vendorId), services_by_category: result });
  } catch (err) {
    console.error("getVendorServicesGrouped error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a vendor service by id OR by vendor_id + category + subcategory
// Body: { id }  OR  { vendor_id, category, subcategory }
const deleteVendorServiceNew = async (req, res) => {
  const { id, vendor_id, category, subcategory } = req.body;

  try {
    let result;
    if (id) {
      result = await pool.query("DELETE FROM vendor_services_flat WHERE id = $1 RETURNING *", [id]);
    } else {
      if (!vendor_id || !category || !subcategory) {
        return res.status(400).json({ error: "Provide id OR vendor_id + category + subcategory" });
      }
      result = await pool.query(
        `DELETE FROM vendor_services_flat
         WHERE vendor_id = $1 AND lower(category) = lower($2) AND lower(subcategory) = lower($3)
         RETURNING *;`,
        [vendor_id, category.trim(), subcategory.trim()]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }
    return res.status(200).json({ message: "Service deleted", deleted: result.rows[0] });
  } catch (err) {
    console.error("deleteVendorService error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  addVendorServicesNew,
  getVendorServicesGrouped,
  deleteVendorServiceNew,addVendorServices, getVendorServicesByEmail , deleteVendorService
};


