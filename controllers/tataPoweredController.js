const pool = require("../config/db");

const getLogin = async (req, res) => {
    try {
        const { employee_id, password } = req.body;

        // Validate input
        if (!employee_id || !password) {
            return res.status(400).json({
                success: false,
                message: "Employee ID and password are required"
            });
        }

        // Query database
        const query = `
            SELECT employee_id, name, email 
            FROM employemaster 
            WHERE employee_id = $1 AND password = $2
        `;

        const result = await pool.query(query, [employee_id, password]);

        // Check user exists
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid employee ID or password"
            });
        }

        // Success
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const createLocation = async (req, res) => {
    try {
        const { latitude, longitude, address, pin_code } = req.body;

        // Validation
        if (!latitude || !longitude || !address || !pin_code) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const query = `
            INSERT INTO locationmaster (latitude, longitude, address, pin_code)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const result = await pool.query(query, [
            latitude,
            longitude,
            address,
            pin_code
        ]);

        return res.status(201).json({
            success: true,
            message: "Location inserted successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Insert Location Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const getLocationById = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT *
            FROM locationmaster
            WHERE location_id = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Location not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Get Location Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const createAttendance = async (req, res) => {
    try {
        const {
            employee_id,
            latitude,
            longitude,
            address,
            attendance_time,
            flag
        } = req.body;

        // Validation
        if (
            !employee_id ||
            !latitude ||
            !longitude ||
            !address ||
            !attendance_time ||
            flag === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (![0, 1].includes(flag)) {
            return res.status(400).json({
                success: false,
                message: "Flag must be 0 (clock-in) or 1 (clock-out)"
            });
        }

        const query = `
            INSERT INTO attendancemaster (
                employee_id,
                latitude,
                longitude,
                address,
                attendance_time,
                flag
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await pool.query(query, [
            employee_id,
            latitude,
            longitude,
            address,
            attendance_time,
            flag
        ]);

        return res.status(201).json({
            success: true,
            message: "Attendance recorded successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Create Attendance Error:", error);

        // Duplicate entry error
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Attendance already exists for this time"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getAllAttendance = async (req, res) => {
    try {
        const query = `
            SELECT 
                attendance_id,
                employee_id,
                latitude,
                longitude,
                address,
                attendance_time,
                flag,
                created_at
            FROM attendancemaster
            ORDER BY attendance_time DESC
        `;

        const result = await pool.query(query);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error("Get Attendance Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const getAttendanceByEmployeeId = async (req, res) => {
    try {
        const { employee_id } = req.params;

        if (!employee_id) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required"
            });
        }

        const query = `
            SELECT 
                attendance_id,
                employee_id,
                latitude,
                longitude,
                address,
                attendance_time,
                flag,
                created_at
            FROM attendancemaster
            WHERE employee_id = $1
            ORDER BY attendance_time DESC
        `;

        const result = await pool.query(query, [employee_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No attendance found for this employee"
            });
        }

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error("Get Attendance By Employee Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};





module.exports = {
    getLogin, createLocation,
    getLocationById, createAttendance,
    getAllAttendance, getAttendanceByEmployeeId
};













