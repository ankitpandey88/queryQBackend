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
            SELECT * 
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

        const user = result.rows[0];
        delete user.password;

        // Success
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: user
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
            evstationid,
            latitude,
            longitude,
            address,
            attendance_time,
            flag
        } = req.body;

        // Validation
        if (
            !employee_id ||
            !evstationid ||
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
                message: "Flag must be 0 (Punch In) or 1 (Punch Out)"
            });
        }

        // ======================
        // PUNCH IN
        // ======================
        if (flag === 0) {
            // Check if already punched in and not punched out
            const checkQuery = `
                SELECT * FROM attendancemaster
                WHERE employee_id = $1
                AND punchout_time IS NULL
            `;
            const checkResult = await pool.query(checkQuery, [employee_id]);

            if (checkResult.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Employee already punched in"
                });
            }

            const insertQuery = `
                INSERT INTO attendancemaster (
                    employee_id,
                    evstationid,
                    latitude,
                    longitude,
                    address,
                    punchin_time
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;

            const result = await pool.query(insertQuery, [
                employee_id,
                evstationid,
                latitude,
                longitude,
                address,
                attendance_time
            ]);

            return res.status(201).json({
                success: true,
                message: "Punch in successful",
                data: result.rows[0]
            });
        }

        // ======================
        // PUNCH OUT
        // ======================
        if (flag === 1) {
            const updateQuery = `
                UPDATE attendancemaster
                SET punchout_time = $1
                WHERE employee_id = $2
                AND punchout_time IS NULL
                RETURNING *
            `;

            const result = await pool.query(updateQuery, [
                attendance_time,
                employee_id
            ]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No active punch-in found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Punch out successful",
                data: result.rows[0]
            });
        }

    } catch (error) {
        console.error("Attendance Error:", error);

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

const getAddress = async (req, res) => {
    try {
        const query = `
            SELECT 
                latitude,
                longitude,
                address,
                pin_code
            FROM locationmaster 
        `;

        const result = await pool.query(query);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error("Get Address Error:", error);
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



// generate random numeric string
const generateRandomNumber = (length) => {
    let num = "";
    for (let i = 0; i < length; i++) {
        num += Math.floor(Math.random() * 10);
    }
    return num;
};

// ensure employee_id is unique
const generateUniqueEmployeeId = async () => {
    let employee_id;
    let exists = true;

    while (exists) {
        employee_id = generateRandomNumber(4);
        const check = await pool.query(
            "SELECT 1 FROM employemaster WHERE employee_id = $1",
            [employee_id]
        );
        exists = check.rows.length > 0;
    }

    return employee_id;
};

// ensure password is unique
const generateUniquePassword = async () => {
    let password;
    let exists = true;

    while (exists) {
        password = generateRandomNumber(6);
        const check = await pool.query(
            "SELECT 1 FROM employemaster WHERE password = $1",
            [password]
        );
        exists = check.rows.length > 0;
    }

    return password;
};

const createEmployee = async (req, res) => {
    try {
        const {
            name,
            age,
            gender,
            address,
            email,
            phone_number,
            latitude,
            longitude,
            pincode,
            state,
            city
        } = req.body;

        // generate unique values
        const employee_id = await generateUniqueEmployeeId();
        const password = await generateUniquePassword();

        const query = `
      INSERT INTO employemaster (
        employee_id,
        name,
        age,
        gender,
        address,
        email,
        phone_number,
        password,
        latitude,
        longitude,
        pincode,
        state,
        city
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      )
    `;

        await pool.query(query, [
            employee_id,
            name,
            age,
            gender,
            address,
            email,
            phone_number,
            password,
            latitude,
            longitude,
            pincode,
            state,
            city
        ]);

        res.status(201).json({
            message: "Employee created successfully",
            employee_id,
            password
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};








module.exports = {
    getLogin, createLocation,
    getLocationById, createAttendance,
    getAllAttendance, getAttendanceByEmployeeId, getAddress, createEmployee
};













