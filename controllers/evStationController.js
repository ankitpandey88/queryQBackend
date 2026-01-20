const pool = require("../config/db");

// Create EV Station
const createEvStation = async (req, res) => {
    try {
        const { evstationid, name, location, latitude, longitude, address } = req.body;

        if (!evstationid || !name || !location || !latitude || !longitude || !address) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const query = `
            INSERT INTO ev_station (evstationid, name, location, latitude, longitude, address)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await pool.query(query, [evstationid, name, location, latitude, longitude, address]);

        return res.status(201).json({
            success: true,
            message: "EV Station created successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Create EV Station Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get All EV Stations
const getAllEvStations = async (req, res) => {
    try {
        const query = "SELECT * FROM ev_station";
        const result = await pool.query(query);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error("Get All EV Stations Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get EV Station by ID
const getEvStationById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = "SELECT * FROM ev_station WHERE evstationid = $1";
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "EV Station not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Get EV Station By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Update EV Station
const updateEvStation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, latitude, longitude, address } = req.body;

        const query = `
            UPDATE ev_station 
            SET name = COALESCE($1, name), 
                location = COALESCE($2, location), 
                latitude = COALESCE($3, latitude), 
                longitude = COALESCE($4, longitude), 
                address = COALESCE($5, address)
            WHERE evstationid = $6
            RETURNING *
        `;

        const result = await pool.query(query, [name, location, latitude, longitude, address, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "EV Station not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "EV Station updated successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Update EV Station Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Delete EV Station
const deleteEvStation = async (req, res) => {
    try {
        const { id } = req.params;
        const query = "DELETE FROM ev_station WHERE evstationid = $1 RETURNING *";
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "EV Station not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "EV Station deleted successfully"
        });

    } catch (error) {
        console.error("Delete EV Station Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};




const createBaseLocation = async (req, res) => {
  try {
    const {
      employee_id,
      evstationid,
      latitude,
      longitude
    } = req.body;

    // 🔒 Check if employee already logged in today
    const checkQuery = `
      SELECT 1
      FROM base_location
      WHERE employee_id = $1
        AND DATE(created_date_time) = CURRENT_DATE
    `;

    const alreadyExists = await pool.query(checkQuery, [employee_id]);

    if (alreadyExists.rows.length > 0) {
      return res.status(403).json({
        message: "Employee already logged in for today"
      });
    }

    // ✅ Insert base location (first login of the day)
    const insertQuery = `
      INSERT INTO base_location (
        employee_id,
        evstationid,
        latitude,
        longitude
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_date_time
    `;

    const result = await pool.query(insertQuery, [
      employee_id,
      evstationid,
      latitude,
      longitude
    ]);

    res.status(201).json({
      message: "Base location created successfully",
      data: {
        employee_id,
        evstationid,
        latitude,
        longitude,
        created_date_time: result.rows[0].created_date_time
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


const getDailyDistanceReport = async (req, res) => {
    try {
        const query = `
            SELECT
                a.employee_id,
                DATE(a.punchin_time) AS attendance_date,
                COUNT(DISTINCT a.evstationid) AS stations_visited,
                ROUND(
                    SUM(
                        6371 * acos(
                            cos(radians(b.latitude)) * cos(radians(a.latitude)) *
                            cos(radians(a.longitude) - radians(b.longitude)) +
                            sin(radians(b.latitude)) * sin(radians(a.latitude))
                        )
                    )::numeric, 2
                ) AS total_distance_km
            FROM attendancemaster a
            JOIN base_location b
                ON a.employee_id = b.employee_id::INTEGER
            GROUP BY a.employee_id, DATE(a.punchin_time)
            ORDER BY a.employee_id, attendance_date;
        `;

        const result = await pool.query(query);

        return res.status(200).json({
            success: true,
            message: "Daily distance report fetched successfully",
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error("Daily Distance Report Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};




module.exports = {
    createEvStation,
    getAllEvStations,
    getEvStationById,
    updateEvStation,
    deleteEvStation,createBaseLocation, getDailyDistanceReport
};
